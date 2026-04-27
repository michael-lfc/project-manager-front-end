import React       from 'react'
import ReactDOM    from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { ThemeProvider }        from './context/ThemeContext.tsx'
import { AuthProvider }         from './context/AuthContext.tsx'
import { SocketProvider }       from './context/SocketContext.tsx'
import { NotificationProvider } from './context/NotificationContext.tsx'
import { ProjectProvider }      from './context/ProjectContext.tsx'

import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <ProjectProvider>
                <App />
              </ProjectProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)