FROM alpine
RUN apk update && apk add python3 && apk add py3-dnspython
COPY test-dns.py /
ENTRYPOINT ["python3","/test-dns.py"]
