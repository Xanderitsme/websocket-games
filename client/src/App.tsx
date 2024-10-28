import { HomePage } from '@/pages/Home'
import { Page404 } from '@/pages/Page404'
import { Route, Routes } from 'react-router-dom'
import { FooterLayout } from './layouts/FooterLayout'
import { MainLayout } from './layouts/MainLayout'
import { SquarePage } from './pages/Square'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<FooterLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/square" element={<SquarePage />} />
        </Route>
        <Route path="*" element={<Page404 />} />
      </Route>
    </Routes>
  )
}

export default App
