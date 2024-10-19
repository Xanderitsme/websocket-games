const tablero = document.getElementById('tablero')
const cuadrado = document.getElementById('cuadrado')

let posX = 0
let posY = 0
let velocidadX = 0 // Velocidad en eje X
let velocidadY = 0 // Velocidad en eje Y

const keys = {
  j: false, // izquierda
  i: false, // arriba
  k: false, // abajo
  l: false // derecha
}

function moveCuadrado() {
  // Actualiza la velocidad
  velocidadX = (keys.l ? 5 : 0) - (keys.j ? 5 : 0)
  velocidadY = (keys.k ? 5 : 0) - (keys.i ? 5 : 0)

  // Actualiza la posición
  posX = Math.max(0, Math.min(670, posX + velocidadX))
  posY = Math.max(0, Math.min(670, posY + velocidadY))

  cuadrado.style.left = posX + 'px'
  cuadrado.style.top = posY + 'px'

  requestAnimationFrame(moveCuadrado)
}

document.addEventListener('keydown', (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true
  }
})

document.addEventListener('keyup', (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = false
  }
})

// requestAnimationFrame(moveCuadrado)
