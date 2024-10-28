import { ControlObject, Player } from '@/types'
import { useEffect, useRef } from 'react'
import { squareMovement } from './square-movement.ts'

interface Props extends Player {
  width: number
  height: number
}

export const SquarePlayer = ({
  width,
  height,
  boost,
  controllable,
  position,
  color
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

    const { onKeyDown, onKeyUp } = squareMovement({
      id: '1',
      $player,
      boost,
      color,
      controllable,
      width,
      height,
      position,
      controls
    })

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [color, controllable, height, position, width, boost])

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
