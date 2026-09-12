#!/usr/bin/env bash

if [ -f /tmp/runner.pid ]; then
  PID=$(cat /tmp/runner.pid)
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" || true
    echo "Stopped runner process $PID" >> /actions-runner/runner.log
  fi
  rm -f /tmp/runner.pid
fi
