import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import IndexPage from './pages/IndexPage'

import OfficersPage from './pages/OfficersPage'
import VotingPage from './pages/VotingPage'
function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      
      <Route path="/Officer" element={<OfficersPage />} />
      <Route path="/VotingPage" element={<VotingPage />} />
    </Routes>
    
  )
}

export default App
