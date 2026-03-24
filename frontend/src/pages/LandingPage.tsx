import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './LandingPage.css'

export const LandingPage = () => {
  const { user } = useAuth()

  return (
    <>
      {/* ═══ COVER ═══ */}
      <div className="cover">
        <div className="rune-border"></div>
        <p className="cover-eyebrow">Conquista dos Nove Reinos</p>
        <h1 className="cover-title">RAGNAROK<br />WARS</h1>
        <p className="cover-subtitle">Conquest of the Nine Realms</p>
        <div className="cover-divider"></div>
        <div className="cover-actions">
          {user ? (
            <Link to="/lobby" className="btn btn-primary btn-large">
              ⚔️ &nbsp;Entrar na Guerra
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-large">
                ⚔️ &nbsp;Criar Conta
              </Link>
              <Link to="/login" className="btn btn-outline">
                Já tenho conta
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <main className="landing-main">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">⚔️</span>
              <h3 className="feature-title">Estratégia Profunda</h3>
              <p>Mecânicas fiéis ao WAR: distribuição de tropas, ataque com dados, cartas e missões secretas.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🗺️</span>
              <h3 className="feature-title">42 Territórios</h3>
              <p>Mapa completo dos Nove Reinos com Midgard, Asgard, Niflheim e mais 3 reinos para conquistar.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3 className="feature-title">6 Facções Únicas</h3>
              <p>Escolha entre Cavaleiros, Magos, Arqueiros, Sombras, Acolytes ou Artesãos. Cada um com habilidade única.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎲</span>
              <h3 className="feature-title">Combate com Dados</h3>
              <p>Até 3 dados de ataque vs 2 de defesa. Habilidades de facção modificam os resultados.</p>
            </div>
          </div>

          {/* Os Seis Reinos */}
          <div className="kingdoms-section">
            <p className="section-eyebrow">Os Reinos</p>
            <h2 className="section-title">Seis <span className="accent">Continentes</span></h2>
            <div className="kingdoms-grid">
              <div className="kingdom-card" style={{ '--k-color': '#C9A227' } as React.CSSProperties}>
                <span>⚔️</span>
                <strong>Midgard</strong>
                <small>12 territórios · +7 tropas</small>
              </div>
              <div className="kingdom-card" style={{ '--k-color': '#27C4C4' } as React.CSSProperties}>
                <span>🌊</span>
                <strong>Asgard</strong>
                <small>9 territórios · +5 tropas</small>
              </div>
              <div className="kingdom-card" style={{ '--k-color': '#6B3FA0' } as React.CSSProperties}>
                <span>🌑</span>
                <strong>Niflheim</strong>
                <small>5 territórios · +2 tropas</small>
              </div>
              <div className="kingdom-card" style={{ '--k-color': '#E05050' } as React.CSSProperties}>
                <span>🌋</span>
                <strong>Muspelheim</strong>
                <small>7 territórios · +4 tropas</small>
              </div>
              <div className="kingdom-card" style={{ '--k-color': '#4CAF50' } as React.CSSProperties}>
                <span>🌿</span>
                <strong>Alfheim</strong>
                <small>5 territórios · +3 tropas</small>
              </div>
              <div className="kingdom-card" style={{ '--k-color': '#1A8B8B' } as React.CSSProperties}>
                <span>❄️</span>
                <strong>Jotunheim</strong>
                <small>4 territórios · +3 tropas</small>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="cta-section">
            {user ? (
              <Link to="/lobby" className="btn btn-primary btn-large">Começar Partida →</Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-large">Criar Conta Grátis →</Link>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
