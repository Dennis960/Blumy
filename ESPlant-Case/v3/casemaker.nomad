# git hash or "latest"
variable "tag" {
  default = "latest"
}

variable "domain" {
  default = "brawltime.ninja"
}

job "casemaker" {
  datacenters = ["dc1"]

  group "web" {
    # run both server and worker on the same node so that they can share the upload directory

    constraint {
      attribute = "${node.class}"
      value = "worker"
    }

    restart {
      mode = "delay"
      interval = "5m"
    }

    network {
      port "http" {}
    }

    service {
      name = "casemaker-web"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.casemaker-web.rule=Host(`casemaker.${var.domain}`)"
      ]
    }

    task "web" {
      driver = "docker"

      env {
        FLASK_UPLOAD_ROOT = "/data/upload"
        FLASK_SECRET_KEY = "changeme"
      }

      config {
        image = "ghcr.io/dennis960/casemaker:${var.tag}"
        ports = ["http"]
        command = "/home/appuser/.local/bin/flask"
        args = ["--app", "server", "run", "--host", "0.0.0.0", "--port", "${NOMAD_PORT_http}"]

        volumes = [
          "casemaker-upload:/data/upload"
        ]
      }

      # FIXME containers do not respect host's DNS settings
      # https://github.com/hashicorp/nomad/issues/12894
      template {
        data = <<-EOF
          {{ with service "redis" }}
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
        FLASK_UPLOAD_ROOT = "/data/upload"
      }

      config {
        image = "ghcr.io/dennis960/casemaker:${var.tag}"
        command = "/home/appuser/.local/bin/celery"
        args = ["-A", "worker", "worker", "--loglevel", "info"]

        volumes = [
          "casemaker-upload:/data/upload"
        ]
      }

      # FIXME containers do not respect host's DNS settings
      # https://github.com/hashicorp/nomad/issues/12894
      template {
        data = <<-EOF
          {{ with service "redis" }}
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
        memory = 512
        memory_max = 512
      }
    }
  }

  group "redis" {
    constraint {
      attribute = "${node.class}"
      value = "database"
    }

    network {
      port "db" {
        static = 6379
      }
    }

    service {
      name = "redis"
      port = "db"

      check {
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }

      check_restart {
        limit = 5
      }
    }

    ephemeral_disk {
      sticky = true
      migrate = true
      size = 2048
    }

    task "redis" {
      driver = "docker"

      config {
        image = "redis:7.0-alpine"
        args = [ "/usr/local/etc/redis/redis.conf" ]

        volumes = [
          "local/redis.conf:/usr/local/etc/redis/redis.conf:ro",
          "alloc/data:/data",
        ]

        ports = ["db"]

        labels = {
          "com.datadoghq.ad.check_names" = jsonencode(["redisdb"])
          "com.datadoghq.ad.init_configs" = jsonencode([{}])
          "com.datadoghq.ad.instances" = jsonencode([{
            host = "${NOMAD_IP_db}",
            port = "${NOMAD_PORT_db}",
          }])
        }
      }

      template {
        data = <<-EOF
          port {{ env "NOMAD_PORT_db" }}
          maxmemory {{ env "NOMAD_MEMORY_LIMIT" }}mb
          maxmemory-policy allkeys-lru
          stop-writes-on-bgsave-error no
        EOF
        # when memory is low, bgsave fails -> don't throw error
        destination = "local/redis.conf"
        change_mode = "signal"
        change_signal = "SIGHUP"
      }

      resources {
        cpu = 128
        memory = 256 # will not usually exceed the limit
        memory_max = 384
      }
    }
  }
}
