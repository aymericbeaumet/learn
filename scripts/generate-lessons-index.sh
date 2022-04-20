#!/bin/sh

jq -nc '$ARGS.positional' --args "$(echo ./static/data/lessons/* | cut -d/ -f5- | cut -d. -f-1)" >./src/assets/lessons-index.json
