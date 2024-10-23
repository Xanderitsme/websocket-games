import { SERVER_EVENTS } from '@/consts'

import {
  ControlObject,
  CreatePlayerArgs,
  CreatePlayerReturnType,
  PlayerType
} from '@/types'
import { io, Socket } from 'socket.io-client'

const $ = (selector: string) => document.querySelector(selector)

export const initGame = () => {
  const appSize = 700

  const app = $('#board')

  if (!(app instanceof HTMLElement)) {
    return
  }

  // app.classList.add(`h-[${appSize}px]`, `w-[${appSize}px]`)
  app.style.height = `${appSize}px`
  app.style.width = `${appSize}px`

  const createPlayer = ({
    id,
    parent,
    controls,
    squareSize = 20,
    position,
    color = 'white',
    speed = 5,
    emitMovement,
    boostStyles = ''
  }: CreatePlayerArgs) => {
    if (!(parent instanceof HTMLElement)) {
      throw new Error('Parent not found')
    }

    const newSquare = document.createElement('div')
    newSquare.style.height = `${squareSize}px`
    newSquare.style.width = `${squareSize}px`
    newSquare.className = `bg-${color} rounded absolute transition`

    newSquare.setAttribute('data-id', id)

    const boostStylesArray = boostStyles.split(' ')

    parent.appendChild(newSquare)

    const $squareElement = $(`[data-id="${id}"]`)

    if (!($squareElement instanceof HTMLElement)) {
      throw new Error('Child element not found')
    }

    const squareData = {
      id,
      domElement: $squareElement,
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
      setPosition({ x, y }: { x: number; y: number }) {
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
      let initialTime: number = 0

      const moveSquare = () => {
        if (squareData.controls.boost) {
          if (initialTime === 0) {
            initialTime = new Date().getTime()
          } else {
            const currentTime = new Date().getTime()

            const elapsedTime = currentTime - initialTime

            if (elapsedTime < 1000) {
              squareData.speed = speed * 2
              squareData.domElement.classList.add(...boostStylesArray)
            } else {
              squareData.speed = speed
              squareData.domElement.classList.remove(...boostStylesArray)
            }
          }
        } else {
          squareData.speed = speed
          initialTime = 0
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
        if (Object.prototype.hasOwnProperty.call(controls, event.key)) {
          squareData.controls[controls[event.key]] = true
        }
      })

      document.addEventListener('keyup', (event) => {
        if (Object.prototype.hasOwnProperty.call(controls, event.key)) {
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
  //   ['ArrowLeft']: controlValues.left,
  //   ['ArrowRight']: controlValues.right,
  //   ['ArrowUp']: controlValues.up,
  //   ['ArrowDown']: controlValues.down,
  //   ['a']: controlValues.boost,
  //   ['s']: controlValues.shoot
  // }

  const controls: ControlObject = {
    j: 'left',
    l: 'right',
    i: 'up',
    k: 'down',
    a: 'boost',
    s: 'shoot'
  }

  const socket = io('http://localhost:3000/', {
    reconnectionDelayMax: 10000,
    auth: {
      id: getId(),
      position: {
        x: 340,
        y: 340
      }
    }
  })

  const emitMovement = (player: PlayerType) => {
    socket.emit(SERVER_EVENTS.UPDATE_USER_SQUARE, player)
  }

  const gameStore = {
    activePlayers: [] as CreatePlayerReturnType[],
    currentPlayer: createPlayer({
      parent: app,
      id: getId(),
      controls,
      position: {
        x: 340,
        y: 340
      },
      speed: 5,
      color: 'sky-400',
      boostStyles: 'drop-shadow-[0_0_20px_rgba(56,189,248,1)]',
      emitMovement
    }),
    updateActivePlayers(player: PlayerType) {
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
    disconnectPlayer(player: PlayerType) {
      const index = this.activePlayers.findIndex((p) => p.id === player.id)

      if (index !== -1) {
        this.activePlayers[index].domElement.remove()
        this.activePlayers.splice(index, 1)
      }
    }
  }

  gameStore.activePlayers.push(gameStore.currentPlayer)

  const socketEvents = {
    [SERVER_EVENTS.PLAYER_JOINED]: (user: PlayerType) => {
      gameStore.updateActivePlayers(user)
    },
    [SERVER_EVENTS.PLAYER_DISCONNECTED]: (user: PlayerType) => {
      gameStore.disconnectPlayer(user)
    },
    [SERVER_EVENTS.UPDATE_USER_SQUARE]: (user: PlayerType) => {
      gameStore.updateActivePlayers(user)
    },
    [SERVER_EVENTS.UPDATE_ALL]: (users: PlayerType[]) => {
      users.forEach((user) => {
        gameStore.updateActivePlayers(user)
      })
    }
  }

  const registerSocketEvents = (socket: Socket) => {
    for (const [event, handler] of Object.entries(socketEvents)) {
      socket.on(event, handler)
    }
  }

  registerSocketEvents(socket)
}
