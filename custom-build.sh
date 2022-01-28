DOCKERFILE=$1

docker buildx build \
  --platform linux/amd64 \
  --tag $IMAGE \
  --push \
  --file $DOCKERFILE \
  $BUILD_CONTEXT
