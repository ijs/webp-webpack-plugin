#!/bin/bash

version=$1

echo "install webpack version: $version"
echo ""

if [[ $version =~ ^[1-9][0-9]?$ ]]; then
  rm -fr src/dist
  npm uni webpack
  npm i webpack@$version.x
  nyc ava tests/index.js
else 
  echo "invalid version"
  
fi