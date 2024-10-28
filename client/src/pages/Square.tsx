import { SquarePlayer } from '@/components/games/SquarePlayer'
import { Player } from '@/types'
import { useEffect, useState } from 'react'

const gameConfig = {
  board: {
    width: 700,
    height: 700
  },
  player: {
    width: 20,
    height: 20,
    initialPosition: {
      x: 340,
      y: 340
    }
  }
}

export const SquarePage = () => {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    const newPlayer = {
      id: crypto.randomUUID(),
      boost: false,
      controllable: true,
      color: '#38bdf8',
      position: {
        x: gameConfig.player.initialPosition.x,
        y: gameConfig.player.initialPosition.y
      }
    }

    setPlayers((players) => {
      const newPlayers = [...players, newPlayer]

      return newPlayers
    })

    return () => {
      setPlayers(() => {
        return []
      })
    }
  }, [])

  return (
    <>
      <main className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center p-4">
          <div className="flex justify-center items-center">
            <div className="mr-2">Tú:</div>
            <div className="w-5 h-5 bg-sky-400 rounded"></div>
            <div className="w-5 h-5 bg-sky-400 rounded drop-shadow-[0_0_20px_rgba(56,189,248,1)] hidden"></div>
          </div>
          <div className="flex justify-center items-center">
            <div className="mr-2">Otros jugadores:</div>
            <div className="w-5 h-5 bg-white rounded"></div>
          </div>
        </div>

        {players.length > 0 && (
          <div
            className="outline outline-4 outline-zinc-400 relative"
            style={{
              width: `${gameConfig.board.width}px`,
              height: `${gameConfig.board.height}px`
            }}
          >
            {players.map((player) => (
              <SquarePlayer
                key={player.id}
                id={player.id}
                boost={player.boost}
                controllable={player.controllable}
                color={player.color}
                position={player.position}
                width={gameConfig.player.width}
                height={gameConfig.player.height}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
