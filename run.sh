#!/bin/bash

LOG_FILE=./logs/`date +%Y-%m-%d_%H:%M.log`

rm -rf node_modules
npm install

if [ "$#" -eq 1 ] && [ $1 = '-d' ]; then
	NODE_COMMAND=node-debug;
else
	NODE_COMMAND=node;
fi;

$NODE_COMMAND run-once.js | tee $LOG_FILE 2>&1
