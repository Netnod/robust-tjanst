## How to create and verify a test

The tests in this folder also work outside of the infrastructure of this project. The tests run in docker so that you are free to choose your favorite programming language and tools. You can also use a base image with an existing test. Remember to parse the results and return a correctly formatted json.


## Expected output of the test

TBD

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
