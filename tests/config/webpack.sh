#!/bin/bash

version=$1

echo "install webpack version: $version"
echo ""

if [[ $version =~ ^[1-9][0-9]?$ ]]; then
  rm -fr src/dist
  npm uni webpack
  npm i webpack@$version.x
  ./node_modules/.bin/nyc ./node_modules/.bin/ava tests/index.js
else 
  echo "invalid version"
  
fi