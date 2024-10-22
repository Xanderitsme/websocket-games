import { asciiIllustrations, emojis } from '@/consts'
import { MainLayout } from '@/layouts/MainLayout'
import '@/ui/page404.css'
import { getRandomElement } from '@/utils'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export const Page404 = () => {
  const [emoji, setEmoji] = useState<string>('')
  const [asciiArt, setAsciiArt] = useState<string>('')

  useEffect(() => {
    setEmoji(getRandomElement(emojis))
    setAsciiArt(getRandomElement(asciiIllustrations))
  }, [])

  return (
    <MainLayout title="Page not found" hideFooter={true}>
      <main className="flex justify-center items-center selection:bg-secondary-500/20">
        <div className="text-secondary-100 max-w-4xl flex flex-col gap-8 p-4">
          <div>
            <h1 className="dynamic-rainbow font-bold text-center w-fit mx-auto text-7xl sm:text-8xl lg:text-9xl">
              {emoji}
            </h1>
          </div>

          <h2 className="font-semibold text-center text-balance text-3xl sm:text-4xl lg:text-5xl">
            ¡Oh, no! Parece que te perdiste.
          </h2>
          <div className="text-center font-light text-balance">
            Parece que estás buscando algo que no existe. ¿Quizás te equivocaste
            de URL? O tal vez la página que buscas se ha trasladado o eliminado.
          </div>

          <div className="flex justify-center mt-4">
            <Link to="/" className="contents">
              <button
                className="px-6 py-4
              font-bold text-lg
              border border-secondary-100
              hover:bg-slate-100 hover:text-zinc-900 transition duration-500"
              >
                Volver al inicio
              </button>
            </Link>
          </div>

          <div>
            <pre
              className="dynamic-rainbow
                text-center font-bold text-[4px] md:text-[6px]
                w-fit mx-auto
                cursor-pointer opacity-80 hover:opacity-90 active:opacity-100
                transition"
              title="Click to copy to the clipboard"
            >
              {asciiArt}
            </pre>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
