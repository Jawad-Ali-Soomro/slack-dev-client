import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import Indexing from './pages/Indexing'
import About from './pages/About'
import Contact from './pages/Contact'
import Teams from './pages/Teams'
import Pricing from './pages/Pricing'
import DevHub from './pages/DevHub'

function App() {
  return (
    <Router>
      <ThemeToggle className="fixed bottom-10 right-10 z-50" />
      <div className="relative">
        <Routes>
          <Route path="/" element={<Indexing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dev-hub" element={<DevHub />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
