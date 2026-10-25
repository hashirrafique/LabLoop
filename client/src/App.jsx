import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Catalogue from './pages/Catalogue.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
