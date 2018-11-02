#!/bin/sh

sleep 10s
cd /skill/dist/app/
npm install
nodemon --ignore address.json