import { io } from '/socket.io.esm.min.js'
import { $, debounce, handleDomElement } from '/utils.js'
;(() => {
  // Find all required html elements

  const $formContainer = $('[data-id="form-container"]')
  const $gameContainer = $('[data-id="game-container"]')
  const $gameHeaderText = $('[data-id="game-header-text"]')
  const $gameMessage = $('[data-id="game-message"]')
  const $userForm = $('[data-id="form-user-data"]')
  const $lobbyMessage = $('[data-id="lobby-message"]')
  const $footerMessage = $('[data-id="footer-message"]')
  const $temporalMessage = $('[data-id="temporal-message"]')

  if (
    !($formContainer instanceof HTMLElement) ||
    !($gameContainer instanceof HTMLElement) ||
    !($gameHeaderText instanceof HTMLElement) ||
    !($gameMessage instanceof HTMLElement) ||
    !($userForm instanceof HTMLFormElement) ||
    !($lobbyMessage instanceof HTMLElement) ||
    !($footerMessage instanceof HTMLElement) ||
    !($temporalMessage instanceof HTMLElement)
  ) {
    return
  }

  const $nameInput = $userForm.elements['name']

  if (!($nameInput instanceof HTMLInputElement)) {
    return
  }

  // Declare global constants

  const playerSchema = {
    id: 'id',
    username: 'username',
    status: 'status',
    clickCount: 'clickCount'
  }

  const PLAYER_STATES = {
    LOBBY: 'lobby',
    WAITING: 'waiting',
    STARTING: 'starting',
    PLAYING: 'playing',
    FINISHED: 'finished'
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

  const clickLimit = 100

  // Define game methods and properties

  const getId = () => {
    const savedId = window.localStorage.getItem(playerSchema.id)

    if (savedId) {
      return savedId
    }

    const newId = crypto.randomUUID()
    window.localStorage.setItem(playerSchema.id, newId)

    return newId
  }

  const getUsername = () => {
    return window.localStorage.getItem(playerSchema.username) || ''
  }

  const gameStore = {
    activePlayers: [],
    clickCount: 0,
    clickCounterEnabled: false,
    gameStatus: PLAYER_STATES.LOBBY,
    onGameStateChange: () => {},
    get currentPlayer() {
      return {
        id: getId(),
        username: getUsername(),
        status: this.gameStatus,
        clickCount: this.clickCount
      }
    },
    get lobbyUsers() {
      return this.activePlayers.filter(
        (player) => player.status === PLAYER_STATES.LOBBY
      )
    },
    get usersWaiting() {
      return this.activePlayers.filter((player) => {
        return player.status === PLAYER_STATES.WAITING
      })
    },
    get usersPlaying() {
      return this.activePlayers.filter(
        (player) => player.status === PLAYER_STATES.PLAYING
      )
    },
    setGameStatus(newState) {
      this.gameStatus = newState

      const index = this.activePlayers.findIndex(
        (p) => p.id === this.currentPlayer.id
      )

      if (index !== -1) {
        this.activePlayers[index].status = newState
      }

      this.onGameStateChange(newState)
    },
    disconnectPlayer(player) {
      const index = this.activePlayers.findIndex((p) => p.id === player.id)

      if (index !== -1) {
        this.activePlayers.splice(index, 1)
      }
    },
    updateActivePlayers(player, field) {
      const index = this.activePlayers.findIndex((p) => p.id === player.id)

      if (index !== -1) {
        if (field) {
          this.activePlayers[index][field] = player[field]
        } else {
          this.activePlayers[index] = player
        }
        return
      }

      this.activePlayers.push(player)
    },
    enableClickCounter() {
      this.clickCount = 0
      this.clickCounterEnabled = true
    },
    stopClickCounter() {
      this.clickCounterEnabled = false
    },
    increaseClickCount() {
      this.clickCount++

      if (this.clickCount >= clickLimit) {
        this.stopClickCounter()
      }
    }
  }

  gameStore.activePlayers.push(gameStore.currentPlayer)

  /* User views management */

  const [, setGameHeader] = handleDomElement($gameHeaderText)
  const [, setGameMessage] = handleDomElement($gameMessage)
  const [, setLobbyMessage] = handleDomElement($lobbyMessage)
  const [, setFooterMessage] = handleDomElement($footerMessage)
  const [, setTempMessage] = handleDomElement($temporalMessage)

  let timeout = null

  const setTemporalMessage = (message, delay = 3000) => {
    setTempMessage(message)
    $temporalMessage.classList.add('opacity-70')
    $temporalMessage.classList.remove('opacity-0')

    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    timeout = setTimeout(() => {
      $temporalMessage.classList.add('opacity-0')
      $temporalMessage.classList.remove('opacity-70')
      setTempMessage('')
    }, delay)
  }

  const view = {
    showOnlineUsers() {
      if (gameStore.gameStatus === PLAYER_STATES.LOBBY) {
        const header = `<div>Usuarios conectados: ${gameStore.activePlayers.length}</div>`

        const body = gameStore.activePlayers
          .map((user) => `<div>⫸ ${user.username} (${user.status})</div>`)
          .join('')

        setLobbyMessage(header + body)
      }
    },
    showNewConnectedUser(user) {
      setTemporalMessage(`${user.username} se acaba de conectar!`)
    },
    showDisconnectedUser(user) {
      setTemporalMessage(`${user.username} se ha desconectado!`)
    },
    showUsersWaiting() {
      if (gameStore.currentPlayer.status === PLAYER_STATES.WAITING) {
        setFooterMessage(
          `Jugadores en la sala de espera ${gameStore.usersWaiting.length} `
        )
      }
    },
    hideUsersWaiting() {
      setFooterMessage('')
    },
    showGameRecomendation() {
      setTemporalMessage(
        `
        Presiona J para incrementar el contador<br>
        Alcanza 100 puntos para ganar
        `,
        5000
      )
    },
    showWaitingStatus(waitingTime) {
      if (gameStore.currentPlayer.status === PLAYER_STATES.WAITING) {
        setGameHeader('Sala de espera')
        const header = `<div>Jugadores listos:</div>`
        const body = gameStore.usersWaiting
          .map((user) => `<div>⪧ ${user.username}</div>`)
          .join('')

        const footer = `
        <div class="mt-2">
          ${
            waitingTime === -1
              ? 'Esperando a otros jugadores para iniciar'
              : `La partida iniciará en ${waitingTime} segundos`
          }
        </div>
        `

        setGameMessage(header + body + footer)
      }
    },
    showGameStatus(users) {
      if (gameStore.currentPlayer.status === PLAYER_STATES.PLAYING) {
        setGameHeader('Juego en curso')

        const players = users
          .map((user) => user)
          .sort((a, b) => b.clickCount - a.clickCount)

        const playersList = players
          .map((player, index) => {
            let styles = 'text-zinc-400'
            let symbol = '⪧'

            if (index === 0) {
              styles = 'text-zinc-200 font-semibold mb-2 text-xl'
              symbol = '⫸'
            } else if (player.id === gameStore.currentPlayer.id) {
              styles = 'text-zinc-200 font-semibold'
            }

            return `
            <div class="${styles}">
            ${symbol} ${player.username}: ${player.clickCount}
            </div>
          `
          })
          .join('')

        setGameMessage(playersList)
      }
    },
    showGameResults() {
      if (gameStore.currentPlayer.status === PLAYER_STATES.FINISHED) {
        setGameHeader('Juego terminado')

        const players = gameStore.activePlayers
          .map((user) => user)
          .sort((a, b) => b.clickCount - a.clickCount)

        const playersList = players
          .map((player, index) => {
            let styles = 'text-zinc-400'
            let symbol = '⪧'
            let extra = ''

            if (index === 0) {
              styles =
                'text-emerald-300 font-semibold mb-4 text-xl drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]'
              symbol = '⫸'
              extra = '(Ganador)'
            } else if (player.id === gameStore.currentPlayer.id) {
              styles = 'text-zinc-200 font-semibold'
              extra = '(Tú)'
            }

            return `
            <div class="${styles}">
              ${symbol} ${player.username}: ${player.clickCount} ${extra}
            </div>
            `
          })
          .join('')

        const footer = `
          <div class="text-sm mt-4 text-zinc-300 font-semibold">
            Presiona ESC para volver al lobby
          </div>
          `

        setGameMessage(playersList + footer)
      }
    },
    showFormContainer() {
      $gameContainer.classList.add('hidden')
      $formContainer.classList.remove('hidden')
      setGameHeader('')
      setGameMessage('')
    },
    showGameContainer() {
      $formContainer.classList.add('hidden')
      $gameContainer.classList.remove('hidden')
      setLobbyMessage('')
    }
  }

  /* Handle socket events */

  const socketEvents = {
    [SERVER_EVENTS.PLAYER_JOINED]: (user) => {
      gameStore.updateActivePlayers(user)
      view.showNewConnectedUser(user)
      view.showOnlineUsers()
    },
    [SERVER_EVENTS.PLAYER_DISCONNECTED]: (user) => {
      gameStore.disconnectPlayer(user)
      view.showDisconnectedUser(user)
      view.showOnlineUsers()
    },
    [SERVER_EVENTS.UPDATE_USER]: (user) => {
      gameStore.updateActivePlayers(user)
      view.showOnlineUsers()
      view.showUsersWaiting()
    },
    [SERVER_EVENTS.UPDATE_ALL]: (users) => {
      users.forEach((user) => {
        gameStore.updateActivePlayers(user, playerSchema.status)
      })

      view.showOnlineUsers()
    },
    [SERVER_EVENTS.WAITING_PLAYERS]: (waitingTime) => {
      view.showWaitingStatus(waitingTime)
      view.showUsersWaiting()
    },
    [SERVER_EVENTS.STARTING_GAME]: (user) => {
      console.log('starting game')
    },
    [SERVER_EVENTS.START_GAME]: (users) => {
      users.forEach((user) => {
        gameStore.updateActivePlayers(user, playerSchema.status)
      })

      if (gameStore.currentPlayer.status === PLAYER_STATES.WAITING) {
        gameStore.setGameStatus(PLAYER_STATES.PLAYING)
        view.hideUsersWaiting()
        view.showGameRecomendation()
        view.showGameStatus(users)
        gameStore.enableClickCounter()
      }
    },
    [SERVER_EVENTS.UPDATE_GAME]: (user) => {
      console.log('update game')

      if (
        gameStore.currentPlayer.status === PLAYER_STATES.PLAYING ||
        gameStore.currentPlayer.status === PLAYER_STATES.FINISHED
      ) {
        gameStore.updateActivePlayers(user, playerSchema.clickCount)
        view.showGameStatus(gameStore.activePlayers)
      }
    },
    [SERVER_EVENTS.FINISH_GAME]: (users) => {
      console.log("It's over")

      users.forEach((user) => {
        gameStore.updateActivePlayers(user, playerSchema.status)
      })

      if (gameStore.currentPlayer.status === PLAYER_STATES.PLAYING) {
        gameStore.setGameStatus(PLAYER_STATES.FINISHED)
        gameStore.stopClickCounter()
      }
    }
  }

  const registerSocketEvents = (socket) => {
    for (const [event, handler] of Object.entries(socketEvents)) {
      socket.on(event, handler)
    }
  }

  const socket = io({
    auth: {
      id: getId(),
      username: getUsername(),
      status: gameStore.gameStatus
    }
  })

  registerSocketEvents(socket)

  /* Handle client side events */

  const gameStateChangeEvents = {
    [PLAYER_STATES.LOBBY]: () => {
      console.log('game state: ', PLAYER_STATES.LOBBY)
      socket.emit(
        SERVER_EVENTS.UPDATE_USER,
        gameStore.currentPlayer,
        playerSchema.status
      )

      view.showFormContainer()

      setFooterMessage('')
    },
    [PLAYER_STATES.WAITING]: () => {
      console.log('game state: ', PLAYER_STATES.WAITING)
      socket.emit(
        SERVER_EVENTS.UPDATE_USER,
        gameStore.currentPlayer,
        playerSchema.status
      )

      view.showGameContainer()
      view.showUsersWaiting()
    },
    [PLAYER_STATES.STARTING]: () => {
      console.log('game state: ', PLAYER_STATES.STARTING)
    },
    [PLAYER_STATES.PLAYING]: () => {
      console.log('game state: ', PLAYER_STATES.PLAYING)
      // view.showGameStatus()
    },
    [PLAYER_STATES.IN_PROGRESS]: () => {
      console.log('game state: ', PLAYER_STATES.IN_PROGRESS)
      view.showGameContainer()
    },
    [PLAYER_STATES.FINISHED]: () => {
      console.log('game state: ', PLAYER_STATES.FINISHED)
      view.showGameContainer()

      view.showGameResults()
    }
  }

  const onGameStateChange = (newState) => {
    if (Object.keys(gameStateChangeEvents).includes(newState)) {
      gameStateChangeEvents[newState]()
      return
    }

    gameStateChangeEvents[PLAYER_STATES.LOBBY]()
  }

  gameStore.onGameStateChange = onGameStateChange

  const [name, setName, getCurrentName] = handleDomElement($nameInput)

  setName(getUsername() ?? '')

  const handleFormSubmit = (e) => {
    e.preventDefault()
    getCurrentName()

    if (name.value === '') {
      return
    }

    window.localStorage.setItem(playerSchema.username, name.value.trim())

    gameStore.setGameStatus(PLAYER_STATES.WAITING)
  }

  $userForm.addEventListener('submit', handleFormSubmit)

  const debouncedHandleInputNameChange = debounce(() => {
    getCurrentName()
    window.localStorage.setItem(playerSchema.username, name.value.trim())

    gameStore.setGameStatus(PLAYER_STATES.LOBBY)
  }, 100)

  $nameInput.addEventListener('input', () => {
    debouncedHandleInputNameChange()
  })

  document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'j') {
      if (
        gameStore.clickCounterEnabled &&
        gameStore.gameStatus === PLAYER_STATES.PLAYING
      ) {
        gameStore.increaseClickCount()

        socket.emit(
          SERVER_EVENTS.UPDATE_USER,
          gameStore.currentPlayer,
          playerSchema.clickCount
        )
      }
    }

    if (e.key === 'Escape' || e.code === 'Escape') {
      if (
        gameStore.gameStatus === PLAYER_STATES.FINISHED ||
        gameStore.gameStatus === PLAYER_STATES.WAITING
      ) {
        gameStore.setGameStatus(PLAYER_STATES.LOBBY)
      }
    }
  })
})()
