#!/bin/bash

LOG_FILE=./logs/`date +%Y-%m-%d_%H:%M.log`

/home/kornel/programs/redis-3.0.5/src/redis-server 2>&1 1>$LOG_FILE &

npm install

if [ "$#" -eq 1 ] && [ $1 = '-d' ]; then
	NODE_COMMAND=node-debug;
else
	NODE_COMMAND=node;
fi;

$NODE_COMMAND index.js | tee $LOG_FILE 2>&1

killall redis-server