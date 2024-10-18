export const playerSchema = {
  id: 'id',
  username: 'username',
  status: 'status',
  clickCount: 'clickCount'
}

export const PLAYER_STATES = {
  LOBBY: 'lobby',
  WAITING: 'waiting',
  STARTING: 'starting',
  PLAYING: 'playing',
  FINISHED: 'finished'
}

export const SERVER_STATES = {
  STARTING_GAME: 'starting_game',
  GAME_IN_PROGRESS: 'game_in_progress',
  GAME_FINISHED: 'game_finished',
  IDLE: 'idle'
}

export const SERVER_EVENTS = {
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

export const clickLimit = 100
