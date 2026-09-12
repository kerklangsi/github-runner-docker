FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies & CLI tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    jq \
    git \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3 \
    python3-pip \
    python3-venv \
    python-is-python3 \
    sudo \
    tar \
    unzip \
    iputils-ping \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Create non-root runner user with passwordless sudo
RUN useradd -m -s /bin/bash runner \
    && echo "runner ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && usermod -aG docker runner

WORKDIR /actions-runner

# Download latest GitHub Actions Runner release
ARG RUNNER_VERSION=2.337.0
RUN echo "Downloading runner version: ${RUNNER_VERSION}" && \
    curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    ./bin/installdependencies.sh

COPY entrypoint.sh run_runner.sh stop_runner.sh web_server.py /actions-runner/
COPY templates /actions-runner/templates

RUN chmod +x /actions-runner/*.sh && \
    chown -R runner:runner /actions-runner

EXPOSE 8080

USER runner

ENTRYPOINT ["/actions-runner/entrypoint.sh"]

