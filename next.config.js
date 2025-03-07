const { withSuperjson } = require('next-superjson')

module.exports = withSuperjson()({})

module.exports = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/search',
          permanent: true,
        },
      ]
    },
  }