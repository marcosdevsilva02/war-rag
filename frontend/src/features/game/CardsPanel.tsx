import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import './CardsPanel.css'

export const CardsPanel: React.FC = () => {
  const { players, activePlayerId, tradeCards, phase } = useGameStore()
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  
  const currentPlayer = players.find(p => p.id === activePlayerId)
  if (!currentPlayer) return null

  const toggleCard = (id: string) => {
    if (selectedCardIds.includes(id)) {
      setSelectedCardIds(selectedCardIds.filter(cardId => cardId !== id))
    } else if (selectedCardIds.length < 3) {
      setSelectedCardIds([...selectedCardIds, id])
    }
  }

  const handleTrade = () => {
    if (selectedCardIds.length === 3) {
      tradeCards(selectedCardIds)
      setSelectedCardIds([])
    }
  }

  const isRecruitment = phase === 'RECRUITMENT'

  return (
    <div className="cards-panel">
      <h3 className="panel-title">Suas Cartas</h3>
      <div className="cards-list">
        {currentPlayer.cards.map((card) => (
          <div 
            key={card.id} 
            className={`card-item ${selectedCardIds.includes(card.id) ? 'selected' : ''}`}
            onClick={() => toggleCard(card.id)}
          >
            <div className="card-symbol">{getSymbolIcon(card.symbol)}</div>
            <div className="card-territory">{card.territoryId === 'WILD' ? 'CORINGA' : card.territoryId}</div>
          </div>
        ))}
        {currentPlayer.cards.length === 0 && <p className="empty-msg">Nenhuma carta ainda.</p>}
      </div>

      {isRecruitment && selectedCardIds.length === 3 && (
        <button className="btn-trade" onClick={handleTrade}>
          Trocar por Tropas
        </button>
      )}
    </div>
  )
}

const getSymbolIcon = (symbol: string) => {
  switch (symbol) {
    case 'KNIGHT': return '⚔️'
    case 'WIZARD': return '🔮'
    case 'ARCHER': return '🏹'
    case 'WILD': return '🃏'
    default: return '❓'
  }
}
