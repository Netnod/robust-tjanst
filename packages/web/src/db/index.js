const { createPool } = require("slonik")

const interceptors = []

// query logging
if (process.env.NODE_ENV !== 'production') {
  interceptors.push(
    require('slonik-interceptor-query-logging').createQueryLoggingInterceptor()
  )
}

const dbPool = createPool(process.env.DATABASE_URL, {interceptors})

module.exports = dbPool