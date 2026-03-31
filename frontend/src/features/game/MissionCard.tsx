import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import './MissionCard.css'

export const MissionCard: React.FC = () => {
  const { players, activePlayerId } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)
  
  const currentPlayer = players.find(p => p.id === activePlayerId)
  if (!currentPlayer) return null

  return (
    <div className={`mission-card-container ${isOpen ? 'open' : ''}`}>
      <button className="btn-mission-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Ocultar Missão' : 'Ver Missão Secreta'}
      </button>
      
      {isOpen && (
        <div className="mission-content">
          <div className="mission-scroll">
            <h4 className="mission-title">Sua Missão Secreta</h4>
            <div className="mission-divider"></div>
            <p className="mission-text">{currentPlayer.mission}</p>
            <p className="mission-hint">Mantenha em segredo dos seus adversários!</p>
          </div>
        </div>
      )}
    </div>
  )
}
