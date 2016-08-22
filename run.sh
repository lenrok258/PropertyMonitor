#!/bin/bash

LOG_FILE=./logs/`date +%Y-%m-%d_%H:%M.log`

npm install

node ./bin/www | tee $LOG_FILE 2>&1