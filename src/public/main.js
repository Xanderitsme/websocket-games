import { io } from '/socket.io.esm.min.js'
import { $, debounce, handleDomElement } from '/utils.js'
;(() => {
  const socket = io({
    auth: {
      id: getId(),
      username: getUsername()
    }
  })

  const $formContainer = $('[data-id="form-container"]')
  const $gameContainer = $('[data-id="game-container"]')
  const $gameStateMessage = $('[data-id="game-state-message"]')
  const $gameMessage = $('[data-id="game-message"]')
  const $userForm = $('[data-id="form-user-data"]')
  const $lobbyMessage = $('[data-id="lobby-message"]')

  if (
    !($formContainer instanceof HTMLElement) ||
    !($gameContainer instanceof HTMLElement) ||
    !($gameStateMessage instanceof HTMLElement) ||
    !($gameMessage instanceof HTMLElement) ||
    !($userForm instanceof HTMLFormElement) ||
    !($lobbyMessage instanceof HTMLElement)
  ) {
    return
  }

  const $nameInput = $userForm.elements['name']

  if (!($nameInput instanceof HTMLInputElement)) {
    return
  }

  const gameData = {
    clickCount: 0,
    clickCounterEnabled: false
  }

  function getUsername() {
    return window.localStorage.getItem('name') || ''
  }

  function getId() {
    const savedId = window.localStorage.getItem('id')

    if (savedId) {
      return savedId
    }

    const newId = crypto.randomUUID()
    window.localStorage.setItem('id', newId)

    return newId
  }

  function getState() {
    if (gameState.value === GAME_STATES.LOBBY) {
      return GAME_STATES.LOBBY
    }

    if (gameState.value === GAME_STATES.WAITING) {
      return GAME_STATES.WAITING
    }

    if (gameState.value === GAME_STATES.IN_PROGRESS) {
      return GAME_STATES.IN_PROGRESS
    }

    return ''
  }

  function getClicksCount() {
    return gameData.clickCount
  }

  function getUser() {
    return {
      id: getId(),
      username: getUsername(),
      status: getState(),
      clickCount: getClicksCount()
    }
  }

  const showFormContainer = () => {
    $formContainer.classList.remove('hidden')
    $gameContainer.classList.add('hidden')
  }

  const showGameContainer = () => {
    $formContainer.classList.add('hidden')
    $gameContainer.classList.remove('hidden')
  }

  const GAME_STATES = {
    LOBBY: 'lobby',
    WAITING: 'waiting',
    START: 'start',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished',
    CLICK: 'click'
  }

  const gameState = {
    state: null,
    get value() {
      return this.state
    },
    set newValue(newState) {
      this.state = newState
      onGameStateChange(newState)
    }
  }

  const setGameState = (value) => {
    gameState.newValue = value
  }

  const [, setGameStateMessage] = handleDomElement($gameStateMessage)
  const [, setMessage] = handleDomElement($gameMessage)
  const [, setLobbyMessage] = handleDomElement($lobbyMessage)

  function createLobbyMessage(data) {
    let message = `<div>Usuarios conectados: ${data.length}</div>`
    message += data.map((user) => `<div>⫸ ${user.username}`).join('')

    return message
  }

  function createGameStateMessage(data) {
    const id = getId()
    const currentUser = data.find((u) => u.id === id)

    let message = data
      .map((user) => {
        if (user.id === id) {
          return ''
        }

        return `<div>⫸ ${user.username} : ${user.clickCount} </div>`
      })
      .join('')

    message += `
      <div class="font-semibold mt-6">
        <span class="text-zinc-500">⫸${currentUser.username}: </span>
        <span class="text-3xl text-white">${currentUser.clickCount}</span>
      </div>
    `

    return message
  }

  function createFinishStateMessage(data) {
    const id = getId()

    data.sort((a, b) => b.clickCount - a.clickCount)

    const message = data
      .map((user, index) => {
        if (index === 0) {
          return `
            <div class="text-zinc-200 font-semibold mt-6">
              <span>Ganador: </span>
              <span class="text-2xl">${user.username}: </span>
              <span class="text-xl">${user.clickCount}</span>
            </div>
          `
        }

        if (user.id === id) {
          return `<div class="text-zinc-400">${index + 1}. ${user.username} : ${
            user.clickCount
          } </div>`
        }

        return `<div>${index + 1}.${user.username} : ${user.clickCount} </div>`
      })
      .join('')

    return message
  }

  socket.on(GAME_STATES.LOBBY, (data) => {
    if (gameState.value !== GAME_STATES.LOBBY) {
      setLobbyMessage('')
      return
    }

    setLobbyMessage(createLobbyMessage(data))
  })

  socket.on(GAME_STATES.WAITING, (msg) => {
    if (gameState.value === GAME_STATES.WAITING) {
      showGameContainer()
      setGameStateMessage('WAITING')
      setMessage(msg)
    }
  })

  socket.on(GAME_STATES.START, (data) => {
    enableClickCounter()
    showGameContainer()
    setGameStateMessage('JUGANDO')
    setGameState(GAME_STATES.IN_PROGRESS)

    setMessage(createGameStateMessage(data))
  })

  socket.on(GAME_STATES.CLICK, (data) => {
    showGameContainer()

    setMessage(createGameStateMessage(data))
  })

  socket.on(GAME_STATES.FINISHED, (data) => {
    stopClickCounter()
    showGameContainer()
    setGameStateMessage('FINALIZADO')
    setGameState(GAME_STATES.FINISHED)

    setMessage(createFinishStateMessage(data))
  })

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

    window.localStorage.setItem('name', name.value)

    setGameState(GAME_STATES.WAITING)
  }

  const onGameStateChange = (newState) => {
    switch (newState) {
      case GAME_STATES.LOBBY:
        showFormContainer()
        setGameStateMessage('')
        socket.emit(GAME_STATES.LOBBY, getUser())
        console.log('lobby')
        break
      case GAME_STATES.WAITING:
        socket.emit(GAME_STATES.WAITING, getUser())
        break
      case GAME_STATES.START:
        socket.emit(GAME_STATES.START, getUser())
        break
      default:
        console.log('Why are you here?')
    }
  }

  function enableClickCounter() {
    gameData.clickCount = 0
    gameData.clickCounterEnabled = true
  }

  function stopClickCounter() {
    gameData.clickCounterEnabled = false
  }

  setGameState(GAME_STATES.LOBBY)

  $userForm.addEventListener('submit', handleFormSubmit)

  const debouncedHandleInputNameChange = debounce(() => {
    getCurrentName()
    window.localStorage.setItem('name', name.value)
    socket.emit(GAME_STATES.LOBBY, getUser())
  }, 100)

  $nameInput.addEventListener('input', () => {
    debouncedHandleInputNameChange()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'j') {
      if (
        gameData.clickCounterEnabled &&
        gameState.value === GAME_STATES.IN_PROGRESS
      ) {
        gameData.clickCount++
        socket.emit(GAME_STATES.CLICK, getUser())

        if (gameData.clickCount >= 100) {
          stopClickCounter()
        }
      }
    }

    if (e.key === 'Escape' || e.code === 'Escape') {
      if (
        gameState.value === GAME_STATES.FINISHED ||
        gameState.value === GAME_STATES.WAITING
      ) {
        setGameState(GAME_STATES.LOBBY)
      }
    }
  })
})()
