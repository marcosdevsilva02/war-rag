import React from 'react'
import { useGameStore } from '../../store/gameStore'
import './GameOverOverlay.css'

export const GameOverOverlay: React.FC = () => {
  const { winnerId, players } = useGameStore()
  
  if (!winnerId) return null

  const winner = players.find(p => p.id === winnerId)

  return (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h1 className="game-over-title">VITÓRIA!</h1>
        <div className="winner-card" style={{ borderColor: winner?.color }}>
          <div className="winner-faction-icon">{winner?.faction?.[0]}</div>
          <h2 className="winner-name">{winner?.name || 'Vencedor Desconhecido'}</h2>
          <p className="winner-faction">{winner?.faction}</p>
        </div>
        <p className="game-over-msg">O mundo de Ragnarok agora está sob seu domínio.</p>
        <button 
          className="btn-return-lobby"
          onClick={() => window.location.href = '/lobby'}
        >
          Voltar ao Lobby
        </button>
      </div>
    </div>
  )
}
