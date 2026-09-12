FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies, Node.js 20 & CLI tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    jq \
    git \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3 \
    python3-pip \
    sudo \
    tar \
    unzip \
    iputils-ping \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create non-root runner user with passwordless sudo
RUN useradd -m -s /bin/bash runner \
    && echo "runner ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Create runner base binaries directory
WORKDIR /actions-runner
ARG RUNNER_VERSION=2.337.0
RUN echo "Downloading runner version: ${RUNNER_VERSION}" && \
    curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    ./bin/installdependencies.sh

# Copy backend & frontend source files
WORKDIR /app
COPY backend /app/backend
COPY frontend /app/frontend

# Build frontend and install backend dependencies
RUN cd /app/frontend && npm install && npm run build
RUN cd /app/backend && npm install

# Create runners storage directory
RUN mkdir -p /opt/github-runners /app/data && \
    chown -R runner:runner /opt/github-runners /app/data /actions-runner /app

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

USER runner

ENTRYPOINT ["/app/entrypoint.sh"]


