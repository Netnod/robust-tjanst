#!/bin/sh

HOST=$1
curl -s --hsts cache.txt https://"$HOST"/ > /dev/null
A=`grep ^"$HOST" cache.txt`
# TODO: look at max-age in the header and options
if [ "x$A" = x ]; then
   echo "{ \"passed\": false, \"details\": { \"tested_url\": \"https://$HOST/\" } }"
else
   echo "{ \"passed\": true, \"details\": { \"tested_url\": \"https://$HOST/\", \"host\": \"$HOST\" } }"
fi

