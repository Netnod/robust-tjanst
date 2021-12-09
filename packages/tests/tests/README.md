# How to create and verify a test

The tests in this folder also work outside of the infrastructure of this project, though they expect the input format specified below. The tests run in docker so that you are free to choose your favorite programming language and tools. You can also use a base image with an existing test. Remember to parse the results and return a correctly formatted json.

# Input to the test

`['example.com:8080', '/somepage', 'example.com', 'https:']`

Parsing URLs is hard, don't do it. We have parsed the user input and give you the parts as different arguments. If your test needs something that's not there, create an [issue](https://github.com/Netnod/robust-tjanst/issues) and let us know.

Tests are called with the following four arguments [host, pathname, hostname, protocol]
For example: 
User input 'https://example.com:8080/somepage' 
leads to test arguments `['example.com:8080', '/somepage', 'example.com', 'https:']`

So a DNS test would use the third argument. A test checking for a http->https redirect on the root path would make a request to 'http://'+arg[0]. A test looking at the content of the page would make a request to arg[3]+'//'+arg[0]+arg[1]

We do not validate the form of __host and hostname__ they might contain an IP-address or something that does not resolve at all
__pathname__ can be an empty string
__protocol__ is guaranteed to be 'http:' or 'https:'

# Output of the test

`'{ passed: true/false, details: { object } }'`

Test result is printed to standard out.
All tests must return a string with JSON containing a boolean __passed__ which is true only if all required demands are met and an object __details__.
The __details__ object is used by the message printing function to create useful error and success messages. As __details__ you should return anything that you want to comment on or show to the end user.

# Message printing

Each test has its own function for generating output which will be shown to the end user. This function is specified as a module in __message.js__

## Input

`{ passed: true/false, details: { object } }`

The input to the message printer is the same output that the test returns. So whatever you put in details you can use to craft your message.

## Output

`{ passed: true/false, title: 'string', description: 'markdown' }`

The message function must return a JSON object which contains a boolean __passed__ and the strings __title__ and __description__.
__title__ should be a string expressing the result of the test in less than 60 characters. Example "Your site has a secure HTTPS configuration" / "There are issues with your HTTPS configuration"
__description__ is a longer string containing [markdown](https://www.markdownguide.org/basic-syntax) explaining what was tested and what the results were in any form suitable to the test.

# How to run a test

You can run a test using docker from the command line. This is useful when creating your own test and when debugging.

    cd dns
    docker build -t robust-dns .
    docker run --rm robust-dns example.com:8080 /somepage example.com https:

# How to contribute your own test

    cp -r dns magic
    cd magic
    # create the magic test...
    docker build -t robust-magic
    docker run --rm robust-dns example.com:8080 /somepage example.com https:
    # when you are satisfied, send it as a pull request and we will love you

# Adding a test

Once a test has been created add it to `packages/tests/index.js` so it will run and `packages/tests/skaffold.yaml` so it will be built.
