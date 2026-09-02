import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import { Shell } from './graphrag/components/Shell.jsx'
import Home from './graphrag/pages/Home.jsx'
import Benchmarks from './graphrag/pages/Benchmarks.jsx'
import Playground from './graphrag/pages/Playground.jsx'
import Statistics from './graphrag/pages/Statistics.jsx'
import './index.css'

function GraphRAGRoutes() {
  return (
    <Shell>
      <Routes>
        <Route index element={<Home />} />
        <Route path="benchmarks" element={<Benchmarks />} />
        <Route path="playground" element={<Playground />} />
        <Route path="statistics" element={<Statistics />} />
      </Routes>
    </Shell>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/graphrag/*" element={<GraphRAGRoutes />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
