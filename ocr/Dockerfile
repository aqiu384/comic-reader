FROM ubuntu:bionic-20190307
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  tesseract-ocr \
  tesseract-ocr-jpn-vert \
  libsm6 \
  locales && \
  rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir \
  Flask \
  opencv-python \
  pytesseract
RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8
