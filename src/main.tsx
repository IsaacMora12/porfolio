import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/Index.css'
import Desktop from './desktop.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Desktop />
  </StrictMode>,
)
