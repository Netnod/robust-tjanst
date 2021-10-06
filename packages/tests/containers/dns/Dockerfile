FROM bash
CMD ["/usr/local/bin/bash", "-c", "sleep 1s && if (( $RANDOM % 2 == 0 )); then echo '{\"name\":\"Test DNS\", \"status\":\"pass\", description:\"Your DNS is good\" }'; else echo {\"name\":\"Test DNS\", \"status\":\"fail\", \"description\":\"Your DNS is not good enough\"}; fi"]
