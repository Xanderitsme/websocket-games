export const playerSchema = {
  id: 'id',
  username: 'username',
  status: 'status',
  clickCount: 'clickCount'
} as const

export const PLAYER_STATES = {
  LOBBY: 'lobby',
  WAITING: 'waiting',
  STARTING: 'starting',
  PLAYING: 'playing',
  FINISHED: 'finished'
} as const

// export const SERVER_STATES = {
//   STARTING_GAME: 'starting_game',
//   GAME_IN_PROGRESS: 'game_in_progress',
//   GAME_FINISHED: 'game_finished',
//   IDLE: 'idle'
// } as const

export const SERVER_EVENTS = {
  PLAYER_JOINED: 'player_joined',
  PLAYER_DISCONNECTED: 'player_disconnected',
  WAITING_PLAYERS: 'waiting_players',
  UPDATE_USER: 'update_user',
  UPDATE_ALL: 'update_all',
  STARTING_GAME: 'starting_game',
  START_GAME: 'start_game',
  UPDATE_GAME: 'update_game',
  FINISH_GAME: 'finish_game',
  UPDATE_USER_SQUARE: 'update_user_square'
} as const

export const controlValues = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down',
  boost: 'boost',
  shoot: 'shoot'
} as const
