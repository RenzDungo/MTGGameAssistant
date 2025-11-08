import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LobbyProvider } from './Lobbycontext.tsx'
import { PlayerProvider } from './PlayerContext.tsx'

createRoot(document.getElementById('root')!).render(
    <LobbyProvider>
        <PlayerProvider>
            <App/>
        </PlayerProvider>
    </LobbyProvider>
)
