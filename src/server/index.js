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

const SERVER_STATES = {
  STARTING_GAME: 'starting_game',
  GAME_IN_PROGRESS: 'game_in_progress',
  GAME_FINISHED: 'game_finished',
  IDLE: 'idle'
}

const SERVER_EVENTS = {
  PLAYER_JOINED: 'player_joined',
  PLAYER_DISCONNECTED: 'player_disconnected',
  WAITING_PLAYERS: 'waiting_players',
  UPDATE_USER: 'update_user',
  UPDATE_ALL: 'update_all',
  STARTING_GAME: 'starting_game',
  START_GAME: 'start_game',
  UPDATE_GAME: 'update_game',
  FINISH_GAME: 'finish_game'
}

const connectedUsers = []

let waitingTime = 5
let interval

const getAuth = (socket) => {
  return socket.handshake.auth
}

const findUser = (id) => {
  return connectedUsers.find((u) => u.id === id)
}

const findIndexUser = (id) => {
  return connectedUsers.findIndex((u) => u.id === id)
}

io.on('connection', (socket) => {
  const handleNewPlayerJoin = () => {
    const user = getAuth(socket)
    console.log(user)

    const index = connectedUsers.findIndex((p) => p.id === user.id)

    if (index === -1) {
      connectedUsers.push(user)
    }

    return user
  }

  io.emit(SERVER_EVENTS.PLAYER_JOINED, handleNewPlayerJoin())
  io.emit(SERVER_EVENTS.UPDATE_ALL, connectedUsers)

  socket.on('disconnect', () => {
    const user = getAuth(socket)

    const index = connectedUsers.findIndex((p) => p.id === user.id)

    if (index !== -1) {
      connectedUsers.splice(index, 1)
    }

    io.emit(SERVER_EVENTS.PLAYER_DISCONNECTED, user)
  })

  socket.on(SERVER_EVENTS.UPDATE_USER, (user, field) => {
    const storedUser = findUser(user.id)

    if (storedUser) {
      storedUser[field] = user[field]

      if (field === 'status') {
        handleUserStatusChange(storedUser)
        return
      }

      io.emit(SERVER_EVENTS.UPDATE_USER, storedUser, field)
    }
  })

  function handleUserStatusChange(user) {
    if (user.status === 'waiting') {
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
    }

    console.log(user)

    io.emit(SERVER_EVENTS.UPDATE_USER, user, 'status')
  }

  // function verifyNewConnectedUser(user) {
  //   const index = connectedUsers.findIndex((u) => u.id === user.id)

  //   if (index !== -1) {
  //     connectedUsers[index].username = user.username
  //   } else {
  //     connectedUsers.push(user)
  //   }
  // }

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
