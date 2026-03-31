import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Board } from '../game-engine/Board'
import { GameControls } from '../features/gameplay/GameControls'
import { useGameStore, type Player } from '../store/gameStore'
import { GameOverOverlay } from '../features/game/GameOverOverlay'
import { PhaseNotification } from '../features/game/PhaseNotification'
import { CardsPanel } from '../features/game/CardsPanel'
import { MissionCard } from '../features/game/MissionCard'
import './GamePage.css'

export const GamePage = () => {
  const { phase, players, activePlayerId } = useGameStore()
  const navigate = useNavigate()

  // Redireciona para lobby se o jogo não foi iniciado
  useEffect(() => {
    if (phase === 'WAITING' || players.length === 0) {
      navigate('/lobby')
    }
  }, [phase, players, navigate])

  return (
    <div className="game-page">
      {/* Sidebar: Info do jogo */}
      <aside className="game-sidebar">
        <div className="sidebar-header">
          <p className="sidebar-eyebrow">Ragnarok Wars</p>
          <GameControls compact />
        </div>

        {/* Jogadores */}
        <div className="players-list">
          <h4 className="sidebar-section-title">Jogadores</h4>
          {players.map((p: Player) => (
            <div
              key={p.id}
              className={`player-item ${p.id === activePlayerId ? 'active' : ''}`}
            >
              <div className="player-color-dot" style={{ background: p.color }} />
              <div className="player-info">
                <span className="player-name">{p.name}</span>
                <small className="player-faction">{p.faction}</small>
              </div>
              {p.id === activePlayerId && <span className="turn-indicator">▶</span>}
            </div>
          ))}
        </div>

        {/* Legenda de Reinos */}
        <div className="kingdoms-legend">
          <h4 className="sidebar-section-title">Reinos</h4>
          <div className="legend-item"><span style={{ color: '#C9A227' }}>■</span> Midgard (+7)</div>
          <div className="legend-item"><span style={{ color: '#27C4C4' }}>■</span> Asgard (+5)</div>
          <div className="legend-item"><span style={{ color: '#6B3FA0' }}>■</span> Niflheim (+2)</div>
          <div className="legend-item"><span style={{ color: '#E05050' }}>■</span> Muspelheim (+4)</div>
          <div className="legend-item"><span style={{ color: '#4CAF50' }}>■</span> Alfheim (+3)</div>
          <div className="legend-item"><span style={{ color: '#1A8B8B' }}>■</span> Jotunheim (+3)</div>
        </div>

        {/* Missões e Cartas */}
        <div className="game-player-actions">
          <MissionCard />
          <CardsPanel />
        </div>
      </aside>

      {/* Área principal do tabuleiro */}
      <main className="game-board-area">
        <Board />
      </main>

      <PhaseNotification />
      <GameOverOverlay />
    </div>
  )
}
