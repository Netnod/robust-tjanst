#!/usr/bin/env python3

import sys
import json
import dns.resolver
import os
from urllib.parse import urlparse

if(len(sys.argv) != 5):
  print("Error: Expected 4 arguments (host:port, path, host, scheme)")
  sys.exit(1)

domain = sys.argv[3]

response = {}
response['details'] = {}
response['details']['domain'] = domain
try:
  answer = dns.resolver.resolve(domain, "AAAA")
  response['passed'] = True
  response['details']['ipv6'] = []
  for record in answer:
    response['details']['ipv6'].append(record.to_text())
except dns.resolver.NoAnswer:
  response['passed'] = False
  response['details']['ipv6'] = ["NO AAAA"]
except dns.resolver.NXDOMAIN:
  response['passed'] = False
  response['details']['ipv6'] = ["NO SUCH DOMAIN"]

print(json.dumps(response))
