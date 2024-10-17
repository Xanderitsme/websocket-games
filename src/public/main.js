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

  if (
    !($formContainer instanceof HTMLElement) ||
    !($gameContainer instanceof HTMLElement) ||
    !($gameHeaderText instanceof HTMLElement) ||
    !($gameMessage instanceof HTMLElement) ||
    !($userForm instanceof HTMLFormElement) ||
    !($lobbyMessage instanceof HTMLElement) ||
    !($footerMessage instanceof HTMLElement)
  ) {
    return
  }

  const $nameInput = $userForm.elements['name']

  if (!($nameInput instanceof HTMLInputElement)) {
    return
  }

  // Declare global constants

  const GAME_STATES = {
    IDLE: 'idle',
    WAITING: 'waiting',
    STARTING: 'starting',
    IN_PROGRESS: 'in_progress',
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

  // Define game methods and properties

  const getId = () => {
    const savedId = window.localStorage.getItem('id')

    if (savedId) {
      return savedId
    }

    const newId = crypto.randomUUID()
    window.localStorage.setItem('id', newId)

    return newId
  }

  const getUsername = () => {
    return window.localStorage.getItem('name') || ''
  }

  const gameStore = {
    activePlayers: [],
    clickCount: 0,
    clickCounterEnabled: false,
    gameStatus: GAME_STATES.IDLE,
    get currentPlayer() {
      return {
        id: getId(),
        username: getUsername(),
        status: this.gameStatus,
        clickCount: this.clickCount
      }
    },
    get lobbyUsers() {
      return this.activePlayers.filter((player) => player.status === 'idle')
    },
    get usersWaiting() {
      return this.activePlayers.filter((player) => player.status === 'waiting')
    },
    get usersPlaying() {
      return this.activePlayers.filter((player) => player.status === 'playing')
    },
    setGameStatus(newState, onGameStateChange) {
      this.gameStatus = newState
      onGameStateChange(newState)
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
    }
  }

  gameStore.activePlayers.push(gameStore.currentPlayer)

  /* User views management */

  const [, setGameHeader] = handleDomElement($gameHeaderText)
  const [, setMessage] = handleDomElement($gameMessage)
  const [, setLobbyMessage] = handleDomElement($lobbyMessage)
  const [, setFooterMessage] = handleDomElement($footerMessage)

  const setFooterMessageDebounced = debounce((value) => {
    setFooterMessage(value)
  }, 3000)

  const view = {
    showOnlineUsers() {
      if (gameStore.gameStatus === 'idle') {
        const header = `<div>Usuarios conectados: ${gameStore.activePlayers.length}</div>`

        const body = gameStore.activePlayers
          .map((user) => `<div>⫸ ${user.username} (${user.status})`)
          .join('')

        setLobbyMessage(header + body)
      }
    },
    showNewConnectedUser(user) {
      setFooterMessage(`El jugador ${user.username} se acaba de conectar!`)
      setFooterMessageDebounced('')
    },
    showDisconnectedUser(user) {
      setFooterMessage(`El jugador ${user.username} se ha desconectado!`)
      setFooterMessageDebounced('')
    },
    showFormContainer() {
      $formContainer.classList.remove('hidden')
      $gameContainer.classList.add('hidden')
    },
    showGameContainer() {
      $formContainer.classList.add('hidden')
      $gameContainer.classList.remove('hidden')
    }
  }

  /* Handle socket events */

  const socketEvents = {
    [SERVER_EVENTS.PLAYER_JOINED]: (user) => {
      gameStore.updateActivePlayers(user)
      view.showNewConnectedUser(user)
      view.showOnlineUsers()

      // console.log('player joined', user)
    },
    [SERVER_EVENTS.PLAYER_DISCONNECTED]: (user) => {
      gameStore.disconnectPlayer(user)
      view.showDisconnectedUser(user)
      view.showOnlineUsers()

      console.log(gameStore.activePlayers)

      console.log('player disconnect', user)
    },
    [SERVER_EVENTS.UPDATE_USER]: (user, field) => {
      gameStore.updateActivePlayers(user, field)
      view.showOnlineUsers()

      // console.log('update user', user)
    },
    [SERVER_EVENTS.UPDATE_ALL]: (users) => {
      users.forEach((user) => {
        gameStore.updateActivePlayers(user, 'status')
      })

      view.showOnlineUsers()

      // console.log('update all users', users.length)
    },
    [SERVER_EVENTS.WAITING_PLAYERS]: (user) => {
      console.log('waiting players')
    },
    [SERVER_EVENTS.STARTING_GAME]: (user) => {
      console.log('starting game')
    },
    [SERVER_EVENTS.START_GAME]: (user) => {
      console.log("Let's play!")
    },
    [SERVER_EVENTS.UPDATE_GAME]: (user) => {
      console.log('update game')
    },
    [SERVER_EVENTS.FINISH_GAME]: (user) => {
      console.log("It's over")
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
    [GAME_STATES.IDLE]: () => {
      console.log('game state: ', GAME_STATES.IDLE)
    },
    [GAME_STATES.WAITING]: () => {
      console.log('game state: ', GAME_STATES.WAITING)
    },
    [GAME_STATES.STARTING]: () => {
      console.log('game state: ', GAME_STATES.STARTING)
    },
    [GAME_STATES.IN_PROGRESS]: () => {
      console.log('game state: ', GAME_STATES.IN_PROGRESS)
    },
    [GAME_STATES.FINISHED]: () => {
      console.log('game state: ', GAME_STATES.FINISHED)
    }
  }

  const onGameStateChange = (newState) => {
    if (Object.keys(gameStateChangeEvents).includes(newState)) {
      gameStateChangeEvents[newState]()
      return
    }

    gameStateChangeEvents[GAME_STATES.IDLE]()
  }

  const [name, setName, getCurrentName] = handleDomElement($nameInput)

  if (getUsername()) {
    setName(getUsername())
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    getCurrentName()

    if (name.value === '') {
      return
    }

    window.localStorage.setItem('name', name.value.trim())

    gameStore.setGameStatus(GAME_STATES.WAITING, onGameStateChange)
  }

  $userForm.addEventListener('submit', handleFormSubmit)

  const debouncedHandleInputNameChange = debounce(() => {
    getCurrentName()
    window.localStorage.setItem('name', name.value.trim())
    socket.emit(GAME_STATES.IDLE, gameStore.currentPlayer)
    socket.emit(SERVER_EVENTS.UPDATE_USER, gameStore.currentPlayer, 'username')
  }, 100)

  $nameInput.addEventListener('input', () => {
    debouncedHandleInputNameChange()
  })
})()
