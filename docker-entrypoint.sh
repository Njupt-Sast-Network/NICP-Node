#!/bin/bash
set -e

if [ "$1" = 'node' ]; then
    chown -R nicp_node:nicp_node "$NICP_UPLOAD_PATH"
    exec gosu nicp_node "$@"
fi

exec "$@"