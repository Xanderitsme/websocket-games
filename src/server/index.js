import express from 'express'
import { createServer } from 'node:http'
import path from 'node:path'
import { Server } from 'socket.io'
import { PLAYER_STATES, SERVER_EVENTS, SERVER_STATES } from './consts.js'

const port = process.env.PORT ?? 4321

const app = express()
const server = createServer(app)
const io = new Server(server)

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

    connectedUsers.push(user)
  })

  const getUsersWaiting = () =>
    connectedUsers.reduce((prev, user) => {
      if (user.status === PLAYER_STATES.WAITING) {
        prev++
      }
      return prev
    }, 0)

  const changeUserStateEvents = {
    [PLAYER_STATES.WAITING]: () => {
      if (!interval) {
        interval = setInterval(() => {
          if (waitingTime === 0) {
            const usersWaiting = getUsersWaiting()

            if (usersWaiting > 1) {
              clearInterval(interval)
              interval = null
              // startGame()
            } else {
              waitingTime = 5
            }
          } else {
            waitingTime--
          }
        }, 1000)
      }
    },
    [PLAYER_STATES.LOBBY]: (user) => {
      const index = findIndexUser(user.id)

      if (index !== -1) {
        if (connectedUsers[index].status === PLAYER_STATES.WAITING) {
          // io.emit(SERVER_EVENTS.WAITING_PLAYERS, getUsersWaiting())
        }
      }
    }
  }

  function handleUserStatusChange(user) {
    io.emit(SERVER_EVENTS.UPDATE_USER, user, 'status')

    if (Object.keys(changeUserStateEvents).includes(user.status)) {
      changeUserStateEvents[user.status](user)
      return
    }
  }

  // function verifyNewWaitingUser(user) {
  //   const index = connectedUsers.findIndex((u) => u.id === user.id)

  //   if (index !== -1) {
  //     connectedUsers.at(index).status = PLAYER_STATES.WAITING
  //   }
  // }

  // function startGame() {
  //   connectedUsers.forEach((user) => {
  //     user.clickCount = 0
  //     user.status = PLAYER_STATES.PLAYING
  //   })

  //   io.emit(PLAYER_STATES.STARTING, connectedUsers)
  // }

  // socket.on(PLAYER_STATES.CLICK, (user) => {
  //   const savedUser = connectedUsers.find((u) => u.id === user.id)

  //   if (!savedUser) {
  //     return
  //   }

  //   savedUser.clickCount++
  //   io.emit(PLAYER_STATES.CLICK, connectedUsers)

  //   if (
  //     savedUser.clickCount >= 100 &&
  //     savedUser.status !== PLAYER_STATES.FINISHED
  //   ) {
  //     connectedUsers.forEach((user) => {
  //       user.status = PLAYER_STATES.FINISHED
  //     })

  //     io.emit(PLAYER_STATES.FINISHED, connectedUsers)
  //   }
  // })

  // socket.on(PLAYER_STATES.WAITING, (user) => {
  //   verifyNewWaitingUser(user)

  //   const waitingUsers = connectedUsers.reduce((prev, user) => {
  //     if (user.status === PLAYER_STATES.WAITING) {
  //       prev++
  //     }
  //     return prev
  //   }, 0)

  //   if (!interval) {
  //     interval = setInterval(() => {
  //       io.emit(
  //         PLAYER_STATES.WAITING,
  //         `${waitingUsers} esperando a más jugadores... empezando en ${waitingTime}`
  //       )

  //       if (waitingTime === 0) {
  //         const currentWaitingUsers = connectedUsers.reduce((prev, user) => {
  //           if (user.status === PLAYER_STATES.WAITING) {
  //             prev++
  //           }
  //           return prev
  //         }, 0)

  //         if (currentWaitingUsers > 1) {
  //           clearInterval(interval)
  //           interval = null
  //           startGame()
  //         } else {
  //           waitingTime = 5
  //         }
  //       } else {
  //         waitingTime--
  //       }
  //     }, 1000)
  //   }
  // })
})

app.use(express.static(path.join(process.cwd(), 'src/public')))

server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`)
})
