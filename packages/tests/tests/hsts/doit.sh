#!/bin/sh

HOST=$1
HEADER=$(curl -s -D- https://"$HOST"/ | grep -i Strict-Transport-Security)
# AGE=$(echo "$HEADER" | awk -v FS="(max-age=|;)" '{print $2}')

# TODO: look at max-age in the header and options
if [ -z "$HEADER" ]; then
   echo "{ \"passed\": false, \"details\": { \"tested_url\": \"https://$HOST/\", \"host\": \"$HOST\" } }"
else
   echo "{ \"passed\": true, \"details\": { \"tested_url\": \"https://$HOST/\", \"host\": \"$HOST\" } }"
fi
