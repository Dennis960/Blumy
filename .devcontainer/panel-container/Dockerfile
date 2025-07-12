FROM ubuntu

ARG KICAD_VERSION="8.0"

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    rm -rf /var/lib/apt/lists/*

RUN add-apt-repository --yes ppa:kicad/kicad-$KICAD_VERSION-releases

ENV PYTHONPATH=/usr/lib/kicad/lib/python3/dist-packages:${PYTHONPATH} \
    LD_LIBRARY_PATH=/usr/lib/kicad/lib/x86_64-linux-gnu/:${LD_LIBRARY_PATH}

RUN export DEBIAN_FRONTEND="noninteractive" && apt-get -qq update && \
    apt-get -qq install -y --no-install-recommends \
      kicad kicad-libraries zip inkscape make git libmagickwand-dev \
      python3 python3-pip python3-wheel python3-setuptools inkscape \
      libgraphicsmagick1-dev libmagickcore-dev openscad && \
      rm -rf /var/lib/apt/lists/*

RUN pip install kikit --break-system-packages