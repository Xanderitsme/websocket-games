import { Home } from '@/pages/Home'
import { Page404 } from '@/pages/Page404'
import { Route, Routes } from 'react-router-dom'
import { Square } from './pages/Square'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/square" element={<Square />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
