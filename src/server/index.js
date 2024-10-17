import express from 'express'
import { createServer } from 'node:http'
import path from 'node:path'
import { Server } from 'socket.io'

const port = process.env.PORT ?? 4321

const app = express()
const server = createServer(app)
const io = new Server(server)

const GAME_STATES = {
  LOBBY: 'lobby',
  WAITING: 'waiting',
  START: 'start',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
  CLICK: 'click'
}

const connectedUsers = []

let waitingTime = 5
let interval

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const user = socket.handshake.auth

    const index = connectedUsers.findIndex((u) => u.id === user.id)

    if (index !== -1) {
      connectedUsers.slice(index, 1)
    }

    updateLobbyData()
  })

  socket.on(GAME_STATES.LOBBY, (user) => {
    verifyNewConnectedUser(user)

    updateLobbyData()
  })

  function updateLobbyData() {
    io.emit(GAME_STATES.LOBBY, connectedUsers)
  }

  function verifyNewConnectedUser(user) {
    const index = connectedUsers.findIndex((u) => u.id === user.id)

    if (index !== -1) {
      connectedUsers[index].username = user.username
    } else {
      connectedUsers.push(user)
    }
  }

  function verifyNewWaitingUser(user) {
    const index = connectedUsers.findIndex((u) => u.id === user.id)

    if (index !== -1) {
      connectedUsers.at(index).status = GAME_STATES.WAITING
    }
  }

  function startGame() {
    connectedUsers.forEach((user) => {
      user.clickCount = 0
      user.status = GAME_STATES.IN_PROGRESS
    })

    io.emit(GAME_STATES.START, connectedUsers)
  }

  socket.on(GAME_STATES.CLICK, (user) => {
    const savedUser = connectedUsers.find((u) => u.id === user.id)

    if (!savedUser) {
      return
    }

    savedUser.clickCount++
    io.emit(GAME_STATES.CLICK, connectedUsers)

    if (
      savedUser.clickCount >= 100 &&
      savedUser.status !== GAME_STATES.FINISHED
    ) {
      connectedUsers.forEach((user) => {
        user.status = GAME_STATES.FINISHED
      })

      io.emit(GAME_STATES.FINISHED, connectedUsers)
    }
  })

  socket.on(GAME_STATES.WAITING, (user) => {
    verifyNewWaitingUser(user)

    const waitingUsers = connectedUsers.reduce((prev, user) => {
      if (user.status === GAME_STATES.WAITING) {
        prev++
      }
      return prev
    }, 0)

    if (!interval) {
      interval = setInterval(() => {
        io.emit(
          GAME_STATES.WAITING,
          `${waitingUsers} esperando a más jugadores... empezando en ${waitingTime}`
        )

        if (waitingTime === 0) {
          const currentWaitingUsers = connectedUsers.reduce((prev, user) => {
            if (user.status === GAME_STATES.WAITING) {
              prev++
            }
            return prev
          }, 0)

          if (currentWaitingUsers > 1) {
            clearInterval(interval)
            interval = null
            startGame()
          } else {
            waitingTime = 5
          }
        } else {
          waitingTime--
        }
      }, 1000)
    }
  })
})

app.use(express.static(path.join(process.cwd(), 'src/public')))

server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`)
})
