FROM alpine
RUN apk update && apk add curl
COPY doit.sh /
ENTRYPOINT ["sh","/doit.sh"]
