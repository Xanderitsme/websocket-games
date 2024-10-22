import { Footer } from '@/components/sections/Footer'
import { Header } from '@/components/sections/Header'
import { Helmet } from 'react-helmet'

interface Props {
  children: React.ReactNode
  title: string
  hideFooter?: boolean
}

export const MainLayout = ({ children, title, hideFooter }: Props) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div
        className="min-h-dvh overflow-y-auto overflow-x-hidden grid grid-rows-[auto_1fr_auto]
          bg-zinc-950 text-zinc-300"
      >
        <Header />
        {children}
        {!hideFooter && <Footer />}
      </div>
    </>
  )
}
