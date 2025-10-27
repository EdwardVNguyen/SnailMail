// helper function to read JSON body from request from POST requests
export const getJSONRequestBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', err => reject(err))
  })
}

