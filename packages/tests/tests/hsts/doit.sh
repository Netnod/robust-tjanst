#!/bin/sh

DOMAIN=$1
curl -s --hsts cache.txt https://"$DOMAIN"/ > /dev/null
A=`grep ^"$DOMAIN" cache.txt`
if [ "x$A" = x ]; then
   echo "ERROR"
   echo "No HSTS for $DOMAIN"
else
   echo "OK"
fi


