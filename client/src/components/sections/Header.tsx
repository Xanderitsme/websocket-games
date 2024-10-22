import { JavascriptIcon } from '@/components/icons/JavascriptIcon'
import { Link } from 'react-router-dom'

export const Header = () => {
  return (
    <>
      <header className="w-dvw bg-zinc-950">
        <div className="flex flex-wrap px-5 py-3 gap-6 justify-between items-center content-center relative">
          <div className="flex flex-wrap gap-y-1.5 gap-x-3">
            <div className="contents">
              <Link to="/" className="mx-auto flex content-center">
                <div className="content-center mr-1">
                  <JavascriptIcon className="w-5 h-5" />
                </div>
                <span className="text-xl font-semibold text-secondary-100">
                  Games
                </span>
              </Link>
            </div>
            <nav>
              <ul
                className="flex flex-wrap items-center font-medium text-zinc-400
                  [&>li]:contents [&>li>a]:inline-block
                  [&>li>a]:text-sm [&>li>a]:px-2 [&>li>a]:py-1
                  [&>li>a:hover]:text-secondary-200 [&>li>a:focus]:text-secondary-200
                  [&>li>a]:transition-colors"
              >
                <li>
                  <Link to="/">Clicker</Link>
                </li>
                <li>
                  <Link to="/square">Square</Link>
                </li>
                <li>
                  <Link to="/404">404</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="contents">
            <button data-id="exit-button"> Salir </button>
          </div>
        </div>
        <div className="border-b border-zinc-800"></div>
      </header>
    </>
  )
}
