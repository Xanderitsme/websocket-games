import { Header } from '@/components/sections/Header'
import { Outlet } from 'react-router-dom'

export const MainLayout = () => {
  return (
    <>
      <div
        className="min-h-dvh overflow-y-auto overflow-x-hidden grid grid-rows-[auto_1fr_auto]
          bg-zinc-950 text-zinc-300"
      >
        <Header />
        <Outlet />
      </div>
    </>
  )
}
