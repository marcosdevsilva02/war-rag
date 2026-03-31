import React, { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import './PhaseNotification.css'

export const PhaseNotification: React.FC = () => {
  const { phase, activePlayerId, players } = useGameStore()
  const [visible, setVisible] = useState(false)
  const [msg, setMsg] = useState('')

  const activePlayer = players.find(p => p.id === activePlayerId)

  useEffect(() => {
    if (phase === 'WAITING') return

    const phaseLabels: Record<string, string> = {
      RECRUITMENT: 'Fase de Recrutamento',
      ATTACK: 'Fase de Ataque',
      MOVEMENT: 'Fase de Movimentação',
      CARDS: 'Fase de Cartas',
    }

    setMsg(phaseLabels[phase] || phase)
    setVisible(true)

    const timer = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (!activePlayer) return
    
    setMsg(`Turno de ${activePlayer.name}`)
    setVisible(true)

    const timer = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(timer)
  }, [activePlayerId])

  if (!visible) return null

  return (
    <div className="phase-notification">
      <div className="notification-content">
        <h2 className="notification-text">{msg}</h2>
        <div className="notification-line"></div>
      </div>
    </div>
  )
}
