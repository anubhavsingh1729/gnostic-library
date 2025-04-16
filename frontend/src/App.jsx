import { useState } from 'react'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './components/Home'
import CompareText from './components/CompareText'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='parent-container'>
      <div className='content-container'>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/compare_text' element={<CompareText />} />
          </Routes>
        </Router>
      </div>
    </div>
  )
}

export default App
