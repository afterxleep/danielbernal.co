require('node-fetch')
import { schedule } from '@netlify/functions'

// Build Hook
const BUILD_HOOK = 'https://api.netlify.com/build_hooks/63336783cc5ea10e6974adc9'

// Every day at 6am
const handler = schedule('0 6 * * *', async () => {
  await fetch(BUILD_HOOK, {
    method: 'POST'
  }).then(response => {
    console.log('Build hook response:', response)
  })

  return {
    statusCode: 200
  }
})

export { handler }