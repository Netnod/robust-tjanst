#!/bin/sh

URL=${4}//${1}${2}

curl -L -6 -s ${URL} > /dev/null
if [ $? -eq 0 ]; then
   echo "{ \"passed\": true, \"details\": { \"tested_url\": \"$URL\" } }"
else
   echo "{ \"passed\": false, \"details\": { \"tested_url\": \"$URL\" } }"
fi
