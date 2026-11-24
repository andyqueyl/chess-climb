#!/bin/sh
# Bump the cache-busting version on every asset (css, app.js, the import map, data fetches). Run before pushing code/data changes.
cd "$(dirname "$0")/.." || exit 1
old=$(sed -n "s/^const V = '\([0-9]*\)';/\1/p" js/app.js); new=$((old + 1))
sed -i.bak "s/?v=$old\"/?v=$new\"/g" index.html && rm index.html.bak
sed -i.bak "s/^const V = '$old';/const V = '$new';/" js/app.js && rm js/app.js.bak
echo "v$old -> v$new"
