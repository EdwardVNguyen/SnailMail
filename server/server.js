import http from 'node:http'
import { handlePostRequest } from './routers/handlePostRequest.js'
import { handleGetRequest } from './routers/handleGetRequest.js'

const PORT = 8000 

const server = http.createServer( (req,res) => {

  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  res.setHeader('Access-Control-Allow-Methods','*')

  // handle preflight request
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  try {
    if (req.method === 'POST') {
      handlePostRequest(req, res)
    } else if (req.method === 'GET') {
      handleGetRequest(req, res)
    } else {
      res.statusCode = 404
      res.end('Request method invalid')
    }
  } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error.message
    }));
  }
})    

server.listen(PORT, () => console.log(`listening to port: ${PORT}`))
