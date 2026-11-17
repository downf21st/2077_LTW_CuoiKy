import { Outlet } from 'react-router-dom'
import Layout from '../Layout/Layout'

export default function MainLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}