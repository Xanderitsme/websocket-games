import { HomePage } from '@/pages/Home'
import { Page404 } from '@/pages/Page404'
import { Route, Routes } from 'react-router-dom'
import { SquarePage } from './pages/Square'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/square" element={<SquarePage />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
