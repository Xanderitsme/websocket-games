import { SquarePlayer } from '@/components/games/SquarePlayer'
import { MainLayout } from '@/layouts/MainLayout'

export const SquarePage = () => {
  return (
    <MainLayout title="Square Game">
      <main className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center p-4">
          <div className="flex justify-center items-center">
            <div className="mr-2">Tú:</div>
            <div className="w-5 h-5 bg-sky-400 rounded"></div>
          </div>
          <div className="flex justify-center items-center">
            <div className="mr-2">Otros jugadores:</div>
            <div className="w-5 h-5 bg-white rounded"></div>
          </div>
        </div>

        <div
          className={`outline outline-4 outline-zinc-400 relative w-[800px] h-[600px]`}
        >
          <SquarePlayer
            boardWidth={800}
            boardHeight={600}
            squareSize={20}
            position={{ x: 390, y: 290 }}
          />
        </div>
      </main>
    </MainLayout>
  )
}
