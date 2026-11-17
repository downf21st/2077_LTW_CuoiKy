import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import CookingMode from './pages/CookingMode'

export default function App() {
  return (
    <Routes>
      {/* KHU VỰC ĐỘC LẬP: KHÔNG CÓ SIDEBAR / HEADER / FOOTER */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cooking-mode-emty" element={<CookingMode />} />
      <Route path="/recipe/:id/cooking-mode" element={<CookingMode />} />
      
      {/* KHU VỰC BỌC LAYOUT CHÍNH: CÓ SIDEBAR / HEADER / FOOTER */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}