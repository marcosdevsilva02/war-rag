import React from 'react'
import { useGameStore } from '../../store/gameStore'

interface GameControlsProps {
  compact?: boolean
}

export const GameControls: React.FC<GameControlsProps> = ({ compact }) => {
  const { phase, nextPhase, activePlayerId, players } = useGameStore()

  const activePlayer = players.find(p => p.id === activePlayerId)
  const recruitmentAmount = activePlayer?.troopsToDistribute || 0

  const phaseLabels: Record<string, string> = {
    RECRUITMENT: '🎯 Recrutamento',
    ATTACK: '⚔️ Ataque',
    MOVEMENT: '🔄 Movimento',
    CARDS: '🃏 Cartas',
    WAITING: '⏳ Aguardando',
  }

  return (
    <div className={`game-controls ${compact ? 'compact' : ''}`}>
      {/* Fase atual */}
      <div className="phase-display">
        <span className="phase-badge">{phaseLabels[phase] || phase}</span>
        {activePlayer && (
          <span className="player-turn-label" style={{ color: activePlayer.color }}>
            Turno de: <strong>{activePlayer.name}</strong>
          </span>
        )}
      </div>

      {/* Info de recrutamento */}
      {phase === 'RECRUITMENT' && recruitmentAmount > 0 && (
        <div className="recruitment-info">
          <span>+{recruitmentAmount} tropas disponíveis</span>
          <small>Clique em seus territórios para distribuir</small>
        </div>
      )}

      {/* Ações */}
      <div className="controls-actions">
        <button onClick={nextPhase} className="btn btn-outline btn-next-phase">
          {phase === 'CARDS' ? 'Próximo Turno →' : 'Próxima Fase →'}
        </button>
      </div>

      <style>{`
        .game-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .game-controls.compact {
          gap: 0.5rem;
        }
        .phase-display {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .phase-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(201,162,39,0.15);
          border: 1px solid rgba(201,162,39,0.3);
          color: var(--gold);
          font-family: 'Cinzel', serif;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 20px;
          width: fit-content;
        }
        .player-turn-label {
          font-size: 12px;
          color: var(--text-muted);
        }
        .recruitment-info {
          background: rgba(201,162,39,0.06);
          border-left: 3px solid var(--gold);
          padding: 0.5rem 0.75rem;
          border-radius: 0 4px 4px 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .recruitment-info span {
          font-family: 'Cinzel', serif;
          font-size: 13px;
          color: var(--gold);
        }
        .recruitment-info small {
          font-size: 11px;
          color: var(--text-muted);
        }
        .btn-next-phase {
          width: 100%;
          justify-content: center;
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}
