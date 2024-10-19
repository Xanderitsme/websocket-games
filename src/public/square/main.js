import { io } from '/socket.io.esm.min.js'
import { $, debounce, handleDomElement } from '/utils.js'
;(() => {
  const SERVER_EVENTS = {
    PLAYER_JOINED: 'player_joined',
    PLAYER_DISCONNECTED: 'player_disconnected',
    UPDATE_USER_SQUARE: 'update_user_square',
    UPDATE_ALL: 'update_all'
  }

  const appSize = 700

  const app = $('#app')

  app.classList.add(`h-[${appSize}px]`, `w-[${appSize}px]`)

  const createPlayer = ({
    id,
    parent,
    controls = null,
    squareSize = 20,
    position = null,
    color = 'white',
    speed = 5,
    emitMovement = null,
    boostStyles = ''
  }) => {
    if (!(parent instanceof HTMLElement)) {
      return
    }

    const newSquare = document.createElement('div')
    newSquare.className = `bg-${color} w-[${squareSize}px] h-[${squareSize}px] rounded absolute`
    newSquare.setAttribute('data-id', id)

    const boostStylesArray = boostStyles.split(' ')

    parent.appendChild(newSquare)

    const squareData = {
      id,
      domElement: $(`[data-id="${id}"]`),
      posX: 0,
      posY: 0,
      speedXAxis: 0,
      speedYAxis: 0,
      speed,
      controls: {
        left: false,
        right: false,
        up: false,
        down: false,
        boost: false,
        shoot: false
      },
      get currentPosition() {
        return {
          x: this.posX,
          y: this.posY
        }
      },
      setPosition({ x, y }) {
        this.posX = x
        this.posY = y

        this.domElement.style.left = `${x}px`
        this.domElement.style.top = `${y}px`
      }
    }

    if (position && position.x !== undefined && position.y !== undefined) {
      squareData.setPosition(position)
    }

    if (controls) {
      let initialTime = null

      const moveSquare = () => {
        if (squareData.controls.boost) {
          if (!initialTime) {
            initialTime = new Date().getTime()
          } else {
            const currentTime = new Date().getTime()

            const elapsedTime = currentTime - initialTime

            if (elapsedTime < 1000) {
              squareData.speed = speed * 1.5
              squareData.domElement.classList.add(...boostStylesArray)
            } else {
              squareData.speed = speed
              squareData.domElement.classList.remove(...boostStylesArray)
            }
          }
        } else {
          squareData.speed = speed
          initialTime = null
          squareData.domElement.classList.remove(...boostStylesArray)
        }

        squareData.speedXAxis =
          (squareData.controls.right ? squareData.speed : 0) -
          (squareData.controls.left ? squareData.speed : 0)

        squareData.speedYAxis =
          (squareData.controls.down ? squareData.speed : 0) -
          (squareData.controls.up ? squareData.speed : 0)

        const initialPosition = squareData.currentPosition

        squareData.posX = Math.max(
          0,
          Math.min(
            appSize - squareSize,
            squareData.posX + squareData.speedXAxis
          )
        )
        squareData.posY = Math.max(
          0,
          Math.min(
            appSize - squareSize,
            squareData.posY + squareData.speedYAxis
          )
        )

        squareData.domElement.style.left = squareData.posX + 'px'
        squareData.domElement.style.top = squareData.posY + 'px'

        const finalPosition = squareData.currentPosition

        if (
          initialPosition.x !== finalPosition.x ||
          initialPosition.y !== finalPosition.y
        ) {
          if (emitMovement) {
            emitMovement({
              id: squareData.id,
              position: finalPosition
            })
          }
        }

        requestAnimationFrame(moveSquare)
      }

      document.addEventListener('keydown', (event) => {
        if (controls.hasOwnProperty(event.key)) {
          squareData.controls[controls[event.key]] = true
        }
      })

      document.addEventListener('keyup', (event) => {
        if (controls.hasOwnProperty(event.key)) {
          squareData.controls[controls[event.key]] = false
        }
      })

      requestAnimationFrame(moveSquare)
    }

    return squareData
  }

  const playerSchema = {
    id: 'id'
  }

  const getId = () => {
    const savedId = window.localStorage.getItem(playerSchema.id)

    if (savedId) {
      return savedId
    }

    const newId = crypto.randomUUID()
    window.localStorage.setItem(playerSchema.id, newId)

    return newId
  }

  // const controls = {
  //   ['ArrowLeft']: 'left',
  //   ['ArrowRight']: 'right',
  //   ['ArrowUp']: 'up',
  //   ['ArrowDown']: 'down',
  //   ['a']: 'boost',
  //   ['s']: 'shoot'
  // }

  const controls = {
    j: 'left',
    l: 'right',
    i: 'up',
    k: 'down',
    a: 'boost',
    s: 'shoot'
  }

  const socket = io({
    auth: {
      id: getId(),
      position: {
        x: 0,
        y: 0
      }
    }
  })

  const emitMovement = (player) => {
    socket.emit(SERVER_EVENTS.UPDATE_USER_SQUARE, player)
  }

  const gameStore = {
    activePlayers: [],
    currentPlayer: createPlayer({
      parent: app,
      id: getId(),
      controls,
      speed: 5,
      color: 'sky-400',
      boostStyles: 'drop-shadow-[0_0_20px_rgba(0,100,200,0.75)]',
      emitMovement
    }),
    updateActivePlayers(player) {
      const index = this.activePlayers.findIndex((p) => p.id === player.id)

      if (index !== -1) {
        if (this.currentPlayer.id !== player.id) {
          this.activePlayers[index].setPosition(player.position)
        }
        return
      }

      const newPlayer = createPlayer({
        id: player.id,
        parent: app,
        position: player.position
      })
      this.activePlayers.push(newPlayer)
    },
    disconnectPlayer(player) {
      const index = this.activePlayers.findIndex((p) => p.id === player.id)

      if (index !== -1) {
        this.activePlayers[index].domElement.remove()
        this.activePlayers.splice(index, 1)
      }
    }
  }

  gameStore.activePlayers.push(gameStore.currentPlayer)

  const socketEvents = {
    [SERVER_EVENTS.PLAYER_JOINED]: (user) => {
      gameStore.updateActivePlayers(user)
    },
    [SERVER_EVENTS.PLAYER_DISCONNECTED]: (user) => {
      gameStore.disconnectPlayer(user)
    },
    [SERVER_EVENTS.UPDATE_USER_SQUARE]: (user) => {
      gameStore.updateActivePlayers(user)
    },
    [SERVER_EVENTS.UPDATE_ALL]: (users) => {
      users.forEach((user) => {
        gameStore.updateActivePlayers(user)
      })
    }
  }

  const registerSocketEvents = (socket) => {
    for (const [event, handler] of Object.entries(socketEvents)) {
      socket.on(event, handler)
    }
  }

  registerSocketEvents(socket)
})()
