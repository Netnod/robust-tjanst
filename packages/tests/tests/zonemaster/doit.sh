#!/bin/sh

zonemaster-cli --level ERROR --no-ipv6 --profile /profile.json $1 2>/dev/null | grep ERROR | tr -s ' ' | cut -d ' ' -f 4-100 > /tmp/foo

A=`head /tmp/foo`

if [ ! "x$A" = x ]; then
    echo "ERROR"
    cat /tmp/foo
else
    echo "OK"
fi





