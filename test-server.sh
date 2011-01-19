#!/bin/env bash

java -jar ../Testing/JsTestDriver.jar --port 9876 &
/usr/bin/chromium --new-window localhost:9876/capture &
/usr/bin/firefox localhost:9876/capture &
