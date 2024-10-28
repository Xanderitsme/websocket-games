import { ControlObject, Player } from '@/types'

interface initGameArgs extends Player {
  $player: HTMLDivElement
  width: number
  height: number
  controls: ControlObject
}

export const squareMovement = ({
  $player,
  width,
  height,
  controllable,
  position,
  controls
}: initGameArgs) => {
  $player.style.top = `${position.y}px`
  $player.style.left = `${position.x}px`

  const boostStyles = 'drop-shadow-[0_0_20px_rgba(56,189,248,1)]'
  const boostStylesArray = boostStyles.split(' ')

  const squareData = {
    baseSpeed: 5,
    speed: 5,
    controls: {
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false,
      shoot: false
    }
  }

  let lastUpdateTime = 0
  const updateInterval = 16.67
  let accumulatedTime = 0
  let boostStartTime = 0

  const moveSquare = (timestamp: number) => {
    if (!lastUpdateTime) lastUpdateTime = timestamp
    const deltaTime = timestamp - lastUpdateTime
    lastUpdateTime = timestamp

    accumulatedTime += deltaTime

    if (squareData.controls.boost) {
      if (boostStartTime === 0) {
        boostStartTime = timestamp
      }

      const elapsedTime = timestamp - boostStartTime

      if (elapsedTime < 1000) {
        squareData.speed = squareData.baseSpeed * 2
        $player.classList.add(...boostStylesArray)
      } else {
        squareData.speed = squareData.baseSpeed
        $player.classList.remove(...boostStylesArray)
      }
    } else {
      squareData.speed = squareData.baseSpeed
      boostStartTime = 0
      $player.classList.remove(...boostStylesArray)
    }

    const speedXAxis =
      (squareData.controls.right ? squareData.speed : 0) -
      (squareData.controls.left ? squareData.speed : 0)
    const speedYAxis =
      (squareData.controls.down ? squareData.speed : 0) -
      (squareData.controls.up ? squareData.speed : 0)

    const currentPosition = {
      x: Number($player.style.left.replace('px', '')),
      y: Number($player.style.top.replace('px', ''))
    }

    while (accumulatedTime >= updateInterval) {
      const newPosition = {
        x: Math.max(0, Math.min(700 - width, currentPosition.x + speedXAxis)),
        y: Math.max(0, Math.min(700 - height, currentPosition.y + speedYAxis))
      }

      if (
        currentPosition.x !== newPosition.x ||
        currentPosition.y !== newPosition.y
      ) {
        $player.style.left = `${newPosition.x}px`
        $player.style.top = `${newPosition.y}px`
        console.log(newPosition)
      }

      accumulatedTime -= updateInterval
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

  if (controllable) {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    requestAnimationFrame(moveSquare)
  }

  return { onKeyUp, onKeyDown }
}
