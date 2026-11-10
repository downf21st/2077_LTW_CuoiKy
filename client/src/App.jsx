import { BrowserRouter } from 'react-router-dom'
import Layout from './components/Layout/Layout'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <h1>Recipe Handbook</h1>
      </Layout>
    </BrowserRouter>
  )
}

export default App