// sends a message that server made a bad request
export const badServerRequest = res => {
    res.statusCode = 500
    res.setHeader('Content-Type','application/json')
    res.end(JSON.stringify({ 
      success: false, 
      message: 'Database query failed'
    }))
}

// sends a message that client made a bad request
export const badClientRequest = (res, error) => {
   res.statusCode = 400 // bad request from client
   res.setHeader('Content-Type', 'application/json')
   res.end(JSON.stringify({success: false, message: error.message}))
}
