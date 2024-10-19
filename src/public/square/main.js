import { io } from '/socket.io.esm.min.js'
import { $, debounce, handleDomElement } from '/utils.js'
;(() => {
  const app = document.getElementById('app')

  const createPlayer = () => {
    const id = crypto.randomUUID()

    app.innerHTML += `
      <div class="bg-white w-6 h-6 rounded absolute" data-id="${id}"></div>
      `

    const $player = $(`[data-id="${id}"]`)

    const gameStore = {
      posX: 0,
      posY: 0,
      speedXAxis: 0,
      speedYAxis: 0,
      controls: {
        j: false,
        i: false,
        k: false,
        l: false
      },
      get position() {
        return {
          x: this.posX,
          y: this.posY
        }
      }
    }

    const moveSquare = () => {
      gameStore.speedXAxis =
        (gameStore.controls.l ? 5 : 0) - (gameStore.controls.j ? 5 : 0)
      gameStore.speedYAxis =
        (gameStore.controls.k ? 5 : 0) - (gameStore.controls.i ? 5 : 0)

      gameStore.posX = Math.max(
        0,
        Math.min(676, gameStore.posX + gameStore.speedXAxis)
      )
      gameStore.posY = Math.max(
        0,
        Math.min(676, gameStore.posY + gameStore.speedYAxis)
      )

      $player.style.left = gameStore.posX + 'px'
      $player.style.top = gameStore.posY + 'px'

      requestAnimationFrame(moveSquare)
    }

    document.addEventListener('keydown', (event) => {
      if (gameStore.controls.hasOwnProperty(event.key)) {
        gameStore.controls[event.key] = true
        // moveSquare()
      }
    })

    document.addEventListener('keyup', (event) => {
      if (gameStore.controls.hasOwnProperty(event.key)) {
        gameStore.controls[event.key] = false
        // moveSquare()
      }
    })

    requestAnimationFrame(moveSquare)
  }

  document.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
      createPlayer()
    }
  })
})()
