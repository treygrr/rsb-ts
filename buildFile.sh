#!/bin/bash
echo $PATH
echo "Node version is $(node -v)"
# run yarn build and pipe the output to terminal
yarn build
# restart pm2 and wait for it to be ready
pm2 restart all

echo "Build complete"

exit 0