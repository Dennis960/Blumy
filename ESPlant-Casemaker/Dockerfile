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
    ocp cadquery https://github.com/CadQuery/OCP-stubs/archive/refs/tags/7.7.0.zip flask celery redis sexpdata
# Info: This docker should not need `pip install ocp_vscode`. If python says it's missing, I forgot to move it to __main__.

COPY ./ /app
WORKDIR /app

ENV PYTHONPATH=/app:/app/casemaker
