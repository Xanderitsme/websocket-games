import { GithubIcon } from '@/components/icons/GithubIcon'
export const Footer = () => {
  return (
    <footer className="flex flex-col gap-2 px-5 py-6 mt-auto">
      <div className="flex justify-center">
        <a
          href="https://github.com/Xanderitsme/websocket-game.git"
          target="_blank"
          rel="noreferrer"
          className="p-2
        text-zinc-800 hover:text-zinc-600
        transition-colors"
        >
          <GithubIcon className="w-6 h-6" />
        </a>
      </div>
    </footer>
  )
}
