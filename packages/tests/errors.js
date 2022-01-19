class KubernetesError extends Error {
  constructor(message, apiResponse) {
    super(message)
    this.name = "KubernetesError"

    try {
      const { status: { message, reason } } = apiResponse
      this.apiResponse = { message, reason }
    } catch {
      this.apiResponse = apiResponse
    }
  }
}

class TestError extends Error {
  constructor(message) {
    super(message)
    this.name = "TestError"
  }
}

module.exports = {
  KubernetesError, TestError
}