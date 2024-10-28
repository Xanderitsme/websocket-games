import { asciiIllustrations, emojis } from '@/consts'
import '@/ui/page404.css'
import { copyToClipboard, getRandomElement } from '@/utils'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export const Page404 = () => {
  const [emoji, setEmoji] = useState<string>('')
  const [asciiArt, setAsciiArt] = useState<string>('')

  const asciiContainerRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    setEmoji(getRandomElement(emojis))
    setAsciiArt(getRandomElement(asciiIllustrations))

    const $asciiContainer = asciiContainerRef.current

    const onAsciiContainerClick = () => {
      if (asciiContainerRef.current !== null) {
        const content = asciiContainerRef.current
          .getHTML()
          .trim()
          .replaceAll('<br>', '\n')
        copyToClipboard(content)
      }
    }

    $asciiContainer?.addEventListener('click', onAsciiContainerClick)

    return () => {
      $asciiContainer?.removeEventListener('click', onAsciiContainerClick)
    }
  }, [])

  return (
    <>
      <main className="h-full flex justify-center items-center selection:bg-secondary-500/20">
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
              ref={asciiContainerRef}
            >
              {asciiArt}
            </pre>
          </div>
        </div>
      </main>
    </>
  )
}
