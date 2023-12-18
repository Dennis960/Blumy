FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN apt-get update && \
    apt-get install -y gpg-agent python-is-python3 redis software-properties-common python3-pip npm && \
    add-apt-repository --yes ppa:kicad/kicad-dev-nightly && \
    apt-get update && \
    apt-get install --install-recommends -y kicad-nightly && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip install numpy --upgrade && \
    pip install \
    ocp_vscode ocp cadquery https://github.com/CadQuery/OCP-stubs/archive/refs/tags/7.7.0.zip flask celery redis sexpdata

RUN npm install -g @types/three

ENV PYTHONPATH=/workspaces/ESPlant/ESPlant-Casemaker:/workspaces/ESPlant/ESPlant-Casemaker/casemaker:$PYTHONPATH