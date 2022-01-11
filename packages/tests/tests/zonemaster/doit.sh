#!/bin/sh

ARGBASE="$1"
ARGPATH="$2"
ARGDOMAIN="$3"
ARGSCHEME="$4"

if [ "x${ARGDOMAIN}" = x ]; then
    echo "ERROR"
    exit 1
fi

# Add period at the end of the domain name if it does not exist
ARGDOMAIN=`echo ${ARGDOMAIN} | sed 's/\.$//' | sed 's/$/./'`

# Check that there is an NS record for the domain name, i.e. find the zone cut
NS=""
while [ "x$NS" = x ]; do
    ARGDOMAIN=`echo "${ARGDOMAIN}" | sed 's/^[^.]*\.//'`
    A=`dig ${ARGDOMAIN} NS +short`
done

zonemaster-cli "${ARGDOMAIN}" --no-ipv6 --json_stream --json_translate | tr -d '\n' | sed 's/}{/}, {/g' > /tmp/foo

## Output should be
# '{ passed: true/false, details: { object } }'

A=`grep \"level\":\"ERROR\" /tmp/foo`
if [ "x$A" = x ]; then
    echo "'{ \"passed\": true, \"details\": [ "`cat /tmp/foo`" ] }'"
else
    echo "'{ \"passed\": false, \"details\": [ "`cat /tmp/foo`" ] }'"
fi


