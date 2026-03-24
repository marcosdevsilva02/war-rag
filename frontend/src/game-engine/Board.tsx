import React, { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { useGameStore } from '../store/gameStore'

export const Board: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const territories = useGameStore((state) => state.territories)

  useEffect(() => {
    const initPixi = async () => {
      if (!canvasRef.current) return

      const app = new PIXI.Application()
      await app.init({
        width: 1024,
        height: 768,
        backgroundColor: 0x0d0a14, // var(--deep)
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      })
      
      canvasRef.current.appendChild(app.canvas)
      appRef.current = app

      // Render Territories
      Object.values(territories).forEach((t) => {
        const graphics = new PIXI.Graphics()
        
        // Kingdom colors (base)
        let colorStr = '#C9A227' // Default gold
        if (t.kingdom === 'Midgard') colorStr = '#C9A227'
        if (t.kingdom === 'Asgard') colorStr = '#27C4C4'
        if (t.kingdom === 'Niflheim') colorStr = '#6B3FA0'
        if (t.kingdom === 'Alfheim') colorStr = '#1A8B8B'
        if (t.kingdom === 'Jotunheim') colorStr = '#27C4C4'
        
        // Convert hex string to number for PIXI
        const baseColor = parseInt(colorStr.replace('#', ''), 16)
        
        // Owner color (if any)
        const owner = useGameStore.getState().players.find(p => p.id === t.ownerId)
        const ownerColor = owner ? parseInt(owner.color.replace('#', ''), 16) : baseColor

        graphics.fill({ color: ownerColor, alpha: t.ownerId ? 0.6 : 0.3 })
        graphics.stroke({ width: 2, color: t.ownerId ? 0xffffff : baseColor, alpha: 0.8 })
        graphics.circle(0, 0, 22)
        
        const container = new PIXI.Container()
        container.x = t.coords.x
        container.y = t.coords.y
        container.addChild(graphics)
        
        // Name Label (Simple for now)
        const style = new PIXI.TextStyle({
          fontFamily: 'Cinzel',
          fontSize: 10,
          fill: '#E8E0CC',
        })
        const text = new PIXI.Text(t.name, style)
        text.anchor.set(0.5)
        text.y = 30
        container.addChild(text)
        
        container.interactive = true
        container.cursor = 'pointer'
        container.on('pointerover', () => { graphics.alpha = 1 })
        container.on('pointerout', () => { graphics.alpha = t.ownerId ? 0.6 : 0.3 })
        
        container.on('pointertap', () => {
          const state = useGameStore.getState()
          if (state.phase === 'RECRUITMENT' && t.ownerId === state.activePlayerId) {
            state.distributeTroops(t.id, 1)
          }
        })
        
        // Troop Count
        if (t.troops > 0) {
          const troopStyle = new PIXI.TextStyle({
            fontFamily: 'Cinzel',
            fontSize: 12,
            fontWeight: 'bold',
            fill: '#000000',
          })
          const troopBadge = new PIXI.Graphics()
          troopBadge.fill({ color: 0xffffff, alpha: 0.9 })
          troopBadge.drawCircle(15, -15, 10)
          
          const troopText = new PIXI.Text(t.troops.toString(), troopStyle)
          troopText.anchor.set(0.5)
          troopText.x = 15
          troopText.y = -15
          
          container.addChild(troopBadge)
          container.addChild(troopText)
        }

        app.stage.addChild(container)
      })
    }

    initPixi()

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true })
        appRef.current = null
      }
    }
  }, [territories])

  return (
    <div className="board-wrapper">
      <div ref={canvasRef} className="pixi-container" />
      <style>{`
        .board-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          background: var(--deep2);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin: 2rem 0;
          overflow: hidden;
        }
        .pixi-container canvas {
          max-width: 100%;
          height: auto;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-strong);
        }
      `}</style>
    </div>
  )
}
