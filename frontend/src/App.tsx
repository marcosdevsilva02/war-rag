import './App.css'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { LoginPage, RegisterPage } from './features/auth/AuthPages'
import { LandingPage } from './pages/LandingPage'
import { LobbyPage } from './pages/LobbyPage'
import { GamePage } from './pages/GamePage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <div className="loading-screen">Carregando Reinos...</div>
  }

  return (
    <Router>
      <div className="app-container">
        {/* Navigation */}
        <nav className="toc-nav">
          <div className="container nav-inner">
            <Link to="/" className="nav-logo">⚔️ Ragnarok Wars</Link>
            <div className="nav-links">
              {!user ? (
                <>
                  <Link to="/login">Entrar</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Cadastrar</Link>
                </>
              ) : (
                <>
                  <Link to="/lobby">Jogar</Link>
                  <span className="nav-separator" />
                  <span className="user-welcome">
                    {user.user_metadata?.nickname || user.email}
                  </span>
                  <button onClick={() => signOut()} className="btn-link">Sair</button>
                </>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lobby" element={user ? <LobbyPage /> : <Navigate to="/login" />} />
          <Route path="/game" element={user ? <GamePage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Footer só fora do jogo */}
        <Routes>
          <Route path="/game" element={null} />
          <Route path="*" element={
            <footer className="doc-footer">
              <div className="container">
                <p>RAGNAROK WARS · v1.0 · Março 2026</p>
              </div>
            </footer>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
