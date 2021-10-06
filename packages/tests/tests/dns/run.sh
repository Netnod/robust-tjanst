#!/usr/bin/env python3

import sys
import json
import dns.resolver

if(len(sys.argv) != 2):
  print("Error")
  sys.exit(1)

response = {}
response['ipv6'] = {}
response['dnssec'] = {}
try:
  answer = dns.resolver.resolve(sys.argv[1], "AAAA")
  response['ipv6']['status'] = "OK"
  response['ipv6']['data'] = []
  for record in answer:
    response['ipv6']['data'].append(record.to_text())
except dns.resolver.NoAnswer:
  response['ipv6']['status'] = "NOK"
  response['ipv6']['data'] = ["NO AAAA"]
except dns.resolver.NXDOMAIN:
  response['ipv6']['status'] = "NOK"
  response['ipv6']['data'] = ["NO SUCH DOMAIN"]

try:
  answer = dns.resolver.resolve(sys.argv[1], "DS")
  response['dnssec']['status'] = "OK"
  response['dnssec']['data'] = []
  for record in answer:
    response['dnssec']['data'].append(record.to_text())
except dns.resolver.NoAnswer:
  response['dnssec']['status'] = "NOK"
  response['dnssec']['data'] = ["NO DS RECORD"]
except dns.resolver.NXDOMAIN:
  response['dnssec']['status'] = "NOK"
  response['dnssec']['data'] = ["NO SUCH DOMAIN"]

print(json.dumps(response))


