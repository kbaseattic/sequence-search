#!/bin/sh

echo "Starting Servers"
python3 main.py &
cd react_app && yarn start