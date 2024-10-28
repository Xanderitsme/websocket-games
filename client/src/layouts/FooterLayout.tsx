import { Footer } from '@/components/sections/Footer'
import { Outlet } from 'react-router-dom'

export const FooterLayout = () => {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  )
}
