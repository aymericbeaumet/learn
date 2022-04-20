#!/bin/sh

find ./static/data/lessons -type f -exec basename -s .md {} \; | jq -R -s -c 'split("\n")[:-1]' >./src/lib/assets/lessons-index.json
