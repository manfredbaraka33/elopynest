import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext.jsx';
import Footer from './components/Footer.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
          <App />
          <Footer />
      </AuthProvider>
    </BrowserRouter>  
  </StrictMode>,
)
