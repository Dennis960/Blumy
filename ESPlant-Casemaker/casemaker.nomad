# git hash or "latest"
variable "tag" {
  default = "latest"
}

variable "domain" {
  default = "brawltime.ninja"
}

job "casemaker" {
  datacenters = ["dc1"]

  priority = 1

  group "web" {
    # run both server and worker on the same node so that they can share the upload directory
    ephemeral_disk {
      migrate = true
      size = 4096
    }

    /*
    constraint {
      attribute = "${node.class}"
      value = "worker"
    }
    */

    restart {
      mode = "delay"
      interval = "5m"
    }

    network {
      port "http" {}
    }

    service {
      name = "casemaker-web"
      provider = "nomad"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.casemaker-web.rule=Host(`casemaker.${var.domain}`)"
      ]
    }

    task "web" {
      driver = "docker"

      env {
        FLASK_UPLOAD_ROOT = "${NOMAD_ALLOC_DIR}/data/uploads"
        FLASK_SECRET_KEY = "changeme"
      }

      config {
        image = "ghcr.io/dennis960/casemaker:${var.tag}"
        ports = ["http"]
        command = "/home/appuser/.local/bin/flask"
        args = ["--app", "server", "run", "--host", "0.0.0.0", "--port", "${NOMAD_PORT_http}"]
      }

      # FIXME containers do not respect host's DNS settings
      # https://github.com/hashicorp/nomad/issues/12894
      template {
        data = <<-EOF
          {{ with nomadService "redis" }}
            CLICKHOUSE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            FLASK_CELERY__broker_url = "redis://{{ with index . 0 }}{{ .Address }}{{ end }}"
            FLASK_CELERY__result_backend = "redis://{{ with index . 0 }}{{ .Address }}{{ end }}"
          {{ end }}
        EOF
        destination = "local/redis.env"
        env = true
      }

      resources {
        cpu = 128
        memory = 384
        memory_max = 384
      }
    }

    task "worker" {
      driver = "docker"

      env {
        FLASK_UPLOAD_ROOT = "${NOMAD_ALLOC_DIR}/data/uploads"
      }

      config {
        image = "ghcr.io/dennis960/casemaker:${var.tag}"
        command = "/home/appuser/.local/bin/celery"
        args = ["-A", "celery_worker.worker", "worker", "--loglevel", "info", "--concurrency", "1"]
      }

      template {
        data = <<-EOF
          {{ with nomadService "redis" }}
            CLICKHOUSE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            FLASK_CELERY__broker_url = "redis://{{ with index . 0 }}{{ .Address }}{{ end }}"
            FLASK_CELERY__result_backend = "redis://{{ with index . 0 }}{{ .Address }}{{ end }}"
          {{ end }}
        EOF
        destination = "local/redis.env"
        env = true
      }

      resources {
        cpu = 128 # very bursty, uses all resources available
        memory = 1024 # 384-512 base load, up to 1024 when converting
        memory_max = 1280
      }
    }
  }
}
