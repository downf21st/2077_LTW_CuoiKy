import Layout from './components/Layout/Layout'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import CookingMode from './pages/CookingMode'

export default function App() {
  return (
    <Routes>
      <Route path="/cooking-mode-emty" element={<CookingMode />} />
      <Route path="/recipe/:id/cooking-mode" element={<CookingMode />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}