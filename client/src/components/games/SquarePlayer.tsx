import { ControlObject, Player, Position } from '@/types'
import { useEffect, useRef } from 'react'
import { squareMovement } from './square-movement.ts'
import { SERVER_EVENTS } from '@/consts/consts.ts'

interface Props extends Player {
  width: number
  height: number
  board: {
    width: number
    height: number
  }
}

export const SquarePlayer = ({
  width,
  height,
  boost,
  controllable,
  position,
  color,
  socket,
  board
}: Props) => {
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const $player = playerRef.current

    if ($player === null) {
      return
    }

    const controls: ControlObject = {
      j: 'left',
      l: 'right',
      i: 'up',
      k: 'down',
      a: 'boost',
      s: 'shoot'
    }

    const emitPosition = (position: Position) => {
      if (socket) {
        socket.emit(SERVER_EVENTS.UPDATE_USER_SQUARE, {
          id: '1',
          position
        })

        console.log(position)
      }
    }

    const { clearEvents } = squareMovement({
      id: '1',
      $player,
      boost,
      color,
      controllable,
      width,
      height,
      position,
      controls,
      emitPosition,
      board
    })

    return () => {
      clearEvents()
    }
  }, [color, controllable, height, position, width, boost, board, socket])

  return (
    <div
      ref={playerRef}
      className="rounded absolute transition"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color
      }}
    ></div>
  )
}
