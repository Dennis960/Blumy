# For FreeCAD cli
FROM amrit3701/freecad-cli:0.21-amd64
RUN useradd --create-home --shell /bin/bash --uid 1001 appuser

RUN apt-get update && \
    apt-get install -y gpg-agent python-is-python3 redis && \
    add-apt-repository --yes ppa:kicad/kicad-dev-nightly && \
    apt-get update && \
    apt-get install --install-recommends -y kicad-nightly && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade --break-system-packages pip

USER appuser

RUN pip install --break-system-packages --user \
    ocp_vscode ocp cadquery https://github.com/CadQuery/OCP-stubs/archive/refs/tags/7.7.0.zip flask celery redis

COPY ./ /app
WORKDIR /app
