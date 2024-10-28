import { controlValues, PLAYER_STATES, playerSchema } from './consts'

interface PlayerType {
  id: string
  position: {
    x: number
    y: number
  }
}

type ControlValues = keyof typeof controlValues
type ControlObject = Record<string, ControlValues>

interface CreatePlayerArgs {
  id: string
  parent: HTMLElement
  controls?: ControlObject
  squareSize?: number
  position?: {
    x: number
    y: number
  }
  color?: string
  speed?: number
  emitMovement?: (player: PlayerType) => void
  boostStyles?: string
}

type CreatePlayerReturnType = ReturnType<typeof createPlayer>

type PlayerStatus = (typeof PLAYER_STATES)[keyof typeof PLAYER_STATES]

interface ClickerPlayerType {
  id: string
  username: string
  status: PlayerStatus
  clickCount: number
}

// type ClickerPlayerKeys = keyof ClickerPlayerType
type ClickerPlayerKeys = (typeof playerSchema)[keyof typeof playerSchema]

type ClickerOnGameStateChangeType = (newState: PlayerStatus) => void

interface Position {
  x: number
  y: number
}

interface Player {
  id: string
  boost: boolean
  controllable: boolean
  position: Position
  color: string
}
