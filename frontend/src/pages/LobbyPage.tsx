import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGameStore } from '../store/gameStore'
import type { Player } from '../store/gameStore'
import './LobbyPage.css'

const FACTIONS = [
  { id: 'knights',   name: 'Cavaleiros de Prontera', icon: '⚔️', passive: 'Bravura: dado extra ao atacar com 3+ tropas', color: '#C9A227' },
  { id: 'mages',     name: 'Magos de Geffen',         icon: '🔮', passive: 'Magia de Guerra: elimina 2 tropas sem dados (custo: 4 tropas)', color: '#9B6DD0' },
  { id: 'archers',   name: 'Arqueiros de Payon',      icon: '🏹', passive: 'Ataque à Distância: ataca 2 fronteiras longe', color: '#27C4C4' },
  { id: 'shadows',   name: 'Sombras de Glast Heim',   icon: '💀', passive: 'Infiltração: ignora item do defensor 1x/partida', color: '#E05050' },
  { id: 'acolytes',  name: 'Santuário de Irmimm',     icon: '✨', passive: 'Bênção: +1 tropa extra no recrutamento com Igreja', color: '#4CAF50' },
  { id: 'smiths',    name: 'Forja de Aldebaran',       icon: '⚙️', passive: 'Comércio: troca cartas com 1 a menos', color: '#FF9800' },
]

const AI_PLAYERS = [
  { id: 'ai-loki',   name: 'Loki (IA)',   factionIndex: 1, color: '#9B6DD0' },
  { id: 'ai-freya',  name: 'Freya (IA)',  factionIndex: 3, color: '#E05050' },
  { id: 'ai-thor',   name: 'Thor (IA)',   factionIndex: 0, color: '#27C4C4' },
]

export const LobbyPage = () => {
  const { user } = useAuth()
  const { startGame } = useGameStore()
  const navigate = useNavigate()

  const [selectedFactionIdx, setSelectedFactionIdx] = useState(0)
  const [playerCount, setPlayerCount] = useState(3) // total jogadores (incluindo o humano)

  const handleStartGame = () => {
    const humanFaction = FACTIONS[selectedFactionIdx]
    
    const humanPlayer: Player = {
      id: user?.id || 'human-1',
      name: user?.user_metadata?.nickname || 'Você',
      faction: humanFaction.name,
      color: humanFaction.color,
      troopsToDistribute: 0,
    }

    const aiPlayers: Player[] = AI_PLAYERS.slice(0, playerCount - 1).map((ai) => ({
      id: ai.id,
      name: ai.name,
      faction: FACTIONS[ai.factionIndex].name,
      color: ai.color,
      troopsToDistribute: 0,
    }))

    startGame([humanPlayer, ...aiPlayers])
    navigate('/game')
  }

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <div className="lobby-header">
          <p className="section-eyebrow">Preparação para a Guerra</p>
          <h1 className="lobby-title">Configurar <span className="accent">Partida</span></h1>
        </div>

        {/* Seleção de Facção */}
        <div className="lobby-section">
          <h3>Escolha sua Facção</h3>
          <div className="faction-grid">
            {FACTIONS.map((f, i) => (
              <button
                key={f.id}
                className={`faction-card ${selectedFactionIdx === i ? 'selected' : ''}`}
                style={{ '--f-color': f.color } as React.CSSProperties}
                onClick={() => setSelectedFactionIdx(i)}
              >
                <span className="faction-icon">{f.icon}</span>
                <strong className="faction-name">{f.name}</strong>
                <small className="faction-passive">{f.passive}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Número de jogadores */}
        <div className="lobby-section">
          <h3>Número de Jogadores</h3>
          <div className="player-count-selector">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                className={`count-btn ${playerCount === count ? 'active' : ''}`}
                onClick={() => setPlayerCount(count)}
              >
                {count} Jogadores
              </button>
            ))}
          </div>
          <p className="lobby-info">Oponentes controlados por IA (versão multiplayer em breve)</p>
        </div>

        {/* Resumo */}
        <div className="lobby-summary">
          <div className="summary-card">
            <span className="summary-icon">{FACTIONS[selectedFactionIdx].icon}</span>
            <div>
              <strong>Sua Facção:</strong> {FACTIONS[selectedFactionIdx].name}
              <br />
              <small>{FACTIONS[selectedFactionIdx].passive}</small>
            </div>
          </div>
        </div>

        <div className="lobby-actions">
          <button className="btn btn-primary btn-large" onClick={handleStartGame}>
            ⚔️ &nbsp;Iniciar a Guerra!
          </button>
        </div>
      </div>
    </div>
  )
}
