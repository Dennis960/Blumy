# For FreeCAD cli
FROM amrit3701/freecad-cli:0.21-amd64

RUN apt-get update
RUN apt-get install gpg-agent -y
RUN add-apt-repository --yes ppa:kicad/kicad-dev-nightly
RUN apt-get update
RUN apt-get install --install-recommends kicad-nightly -y

RUN pip install --upgrade pip --break-system-packages
RUN pip install ocp_vscode ocp cadquery --break-system-packages

RUN apt-get install -y git
RUN git clone https://github.com/CadQuery/OCP-stubs
RUN cd OCP-stubs && python3 setup.py install
RUN apt-get install -y python-is-python3

RUN apt-get install -y redis python3-flask python3-celery python3-redis