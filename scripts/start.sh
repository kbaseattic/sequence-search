#!/bin/sh

echo "Building"
cd react_app && yarn build && cd ..
python3 main.py