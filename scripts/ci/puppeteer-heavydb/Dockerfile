FROM ubuntu:22.04 AS extract

WORKDIR /opt/heavyai
COPY product.tar.gz /tmp/product.tar.gz
RUN tar xzf /tmp/product.tar.gz --strip-components=1 -C /opt/heavyai

FROM nvcr.io/nvidia/cuda:12.9.1-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      bsdmainutils \
      ca-certificates \
      clang-14 \
      curl \
      default-jre-headless \
      libegl1 \
      libglx0 \
      liblz4-tool \
      libopengl0 \
      libpython3.10 \
      procps \
      python3.10 \
      python3.10-venv \
      zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=extract /opt/heavyai /opt/heavyai
COPY entrypoint.sh /opt/heavyai/ci-entrypoint.sh
RUN chmod +x /opt/heavyai/ci-entrypoint.sh

WORKDIR /opt/heavyai
EXPOSE 6273 6274 6278 6279

HEALTHCHECK --interval=5s --timeout=5s --start-period=20s --retries=24 \
  CMD printf 'SELECT 1;\n' | /opt/heavyai/bin/heavysql heavyai -u admin -p HyperInteractive >/dev/null

ENTRYPOINT ["/opt/heavyai/ci-entrypoint.sh"]
