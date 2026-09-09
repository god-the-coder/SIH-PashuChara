import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <h1 className="text-4xl font-bold text-green-800">
        PashuChara AI
      </h1>
    </div>
  )
}

export default App
