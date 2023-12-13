FROM ubuntu
RUN useradd --create-home --shell /bin/bash --uid 1001 appuser

RUN apt-get update && \
    apt-get install -y gpg-agent python-is-python3 redis software-properties-common python3-pip && \
    add-apt-repository --yes ppa:kicad/kicad-dev-nightly && \
    apt-get update && \
    apt-get install --install-recommends -y kicad-nightly && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER appuser

RUN pip install --user numpy --upgrade && \
    pip install --user \
    ocp_vscode ocp https://github.com/CadQuery/cadquery/archive/79e64e557e87d63b84c1c8a60c0df8e941a1a4a1.zip https://github.com/CadQuery/OCP-stubs/archive/refs/tags/7.7.0.zip flask celery redis

COPY ./ /app
WORKDIR /app
