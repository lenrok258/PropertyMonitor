#!/bin/bash

LOG_FILE=./logs/`date +%Y-%m-%d_%H:%M.log`

~/programs/redis/src/redis-server &

npm install

node index.js | tee $LOG_FILE 2>&1

killall redis