FROM alpine
RUN apk update && apk add bind-tools
COPY run.sh /
RUN chmod +x /run.sh
CMD ["/bin/sh", "-c", "/run.sh"]
