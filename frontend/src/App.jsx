import { useState } from 'react'
import "./App.css"

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './components/Home'
import CompareText from './components/CompareText'
import BookText from './components/Booktext'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='parent-container'>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/compare_text' element={<CompareText />} />
            <Route path ='/view_text' element={<BookText />} />
          </Routes>
        </Router>
    </div>
  )
}

export default App
