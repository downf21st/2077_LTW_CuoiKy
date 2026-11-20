import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import CookingMode from './pages/CookingMode'
import Unauthorized from './pages/Unauthorized'
import RecipeForm from './pages/RecipeForm'
import AdminPanel from './pages/AdminPanel'
import MyAccountLayout from './pages/MyAccount/MyAccountLayout'
import Profile from './pages/MyAccount/Profile'
import MyRecipes from './pages/MyAccount/MyRecipes'
import Favorites from './pages/MyAccount/Favorites'
import WeeklyMenu from './pages/MyAccount/WeeklyMenu'

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
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allowedRoles={['member', 'admin']} />}>
          <Route path="/my-account" element={<MyAccountLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-recipes" element={<MyRecipes />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="weekly-menu" element={<WeeklyMenu />} />
          </Route>
          <Route path="/recipe/create" element={<RecipeForm />} />
          <Route path="/recipe/edit/:id" element={<RecipeForm />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}