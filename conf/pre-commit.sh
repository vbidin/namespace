#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

yarn lint-staged -c conf/lintstaged.json
