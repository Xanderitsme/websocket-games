import { ControlObject } from '@/types'
import { useEffect, useRef } from 'react'

interface Position {
  x: number
  y: number
}

interface Props {
  boardWidth: number
  boardHeight: number
  squareSize: number
  position: Position
}

// const initialPosition = { x: 340, y: 340 }

export const SquarePlayer = ({
  boardWidth,
  boardHeight,
  squareSize,
  position
}: Props) => {
  // const [position] = useState<Position>(initialPosition)

  const playerRef = useRef<HTMLDivElement>(null)
  const boostStyles = 'drop-shadow-[0_0_20px_rgba(56,189,248,1)]'

  useEffect(() => {
    if (playerRef.current === null) {
      return
    }

    const boostStylesArray = boostStyles.split(' ')

    const squareData = {
      domElement: playerRef.current,
      speed: 0,
      posX: position.x,
      posY: position.y,
      speedXAxis: 0,
      speedYAxis: 0,
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

    squareData.setPosition({
      x: squareData.posX,
      y: squareData.posY
    })

    const controls: ControlObject = {
      j: 'left',
      l: 'right',
      i: 'up',
      k: 'down',
      a: 'boost',
      s: 'shoot'
    }

    const speed = 5

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
          boardWidth - squareSize,
          squareData.posX + squareData.speedXAxis
        )
      )
      squareData.posY = Math.max(
        0,
        Math.min(
          boardHeight - squareSize,
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
        // if (emitMovement) {
        console.log({
          position: finalPosition
        })
        // }
      }

      requestAnimationFrame(moveSquare)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (Object.prototype.hasOwnProperty.call(controls, event.key)) {
        squareData.controls[controls[event.key]] = true
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (Object.prototype.hasOwnProperty.call(controls, event.key)) {
        squareData.controls[controls[event.key]] = false
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    requestAnimationFrame(moveSquare)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [boardWidth, boardHeight, squareSize, position])

  useEffect(() => {
    if (playerRef.current !== null) {
      playerRef.current.style.top = `${position.y}px`
      playerRef.current.style.left = `${position.x}px`
    }
  }, [position])

  return (
    <div
      className="w-[20px] h-[20px] bg-sky-400 rounded absolute"
      ref={playerRef}
    ></div>
  )
}
