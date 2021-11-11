## How to create and verify a test

The tests in this folder also work outside of the infrastructure of this project. The tests run in docker so that you are free to choose your favorite programming language and tools. You can also use a base image with an existing test. Remember to parse the results and return a correctly formatted json.

## Input to the test

Parsing URLs is hard, therefore we have parsed the url and give you the parts as different arguments. If your test needs something that's not there, create an [issue](https://github.com/Netnod/robust-tjanst/issues) and let us know.

Tests are called with the following four arguments [host, pathname, hostname, protocol]
For example: 
User input 'https://example.com:8080/somepage' 
leads to test arguments ['example.com:8080', '/somepage', 'example.com', 'https:']

So a DNS test would use the third argument. A test checking for a http->https redirect on the root path would make a request to 'http://'+arg[0]. A test looking at the content of the page would make a request to arg[3]+'//'+arg[0]+arg[1]

We do not validate the form of __host and hostname__ they might contain an IP-address or something that does not resolve at all
__pathname__ can be an empty string
__protocol__ is guaranteed to be 'http:' or 'https:'

## Output of the test

{ passed: true/false }

## How to run a test

This is the easiest way to run a test

    cd dns
    docker build -t robust-dns .
    docker run --rm robust-dns example.com

## How to contribute your own test

    cp -r dns magic
    cd magic
    # create the magic test...
    docker build -t robust-magic
    docker run --rm robust-magic example.com
    
    # when you are satisfied, send it as a pull request and we will love you
