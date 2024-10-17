import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const port = process.env.PORT ?? 4321

const app = express()
const server = createServer(app)
const io = new Server()

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/src/client/index.html')
})

app.get('/styles.css', (req, res) => {
  res.sendFile(process.cwd() + '/src/client/styles.css')
})

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`)
})
