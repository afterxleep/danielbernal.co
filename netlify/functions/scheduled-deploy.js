const fetch = require('node-fetch')

co
// This is sample build hook
const BUILD_HOOK = 'https://api.netlify.com/build_hooks/63336783cc5ea10e6974adc9'

const handler = async () => {
  await fetch(BUILD_HOOK, {
    method: 'POST'
  }).then((response) => {
    console.log('Build hook response:', response.json())
  })

  return {
    statusCode: 200
  }
}

export {
  handler
}