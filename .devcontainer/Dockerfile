# For FreeCAD cli
FROM amrit3701/freecad-cli:0.21-amd64

RUN apt-get update
RUN apt-get install gpg-agent -y
RUN add-apt-repository --yes ppa:kicad/kicad-dev-nightly
RUN apt-get update
RUN apt-get install --install-recommends kicad-nightly -y

RUN pip install --upgrade pip --break-system-packages
RUN pip install cadquery --break-system-packages
RUN pip install ocp_vscode --break-system-packages