import React, { useEffect, useRef, useCallback, useState } from 'react'
import * as PIXI from 'pixi.js'
import { useGameStore } from '../store/gameStore'
import type { Territory } from '../store/gameStore'

// Cores por reino
const KINGDOM_COLORS: Record<string, number> = {
  Midgard:    0xC9A227,
  Asgard:     0x27C4C4,
  Niflheim:   0x6B3FA0,
  Muspelheim: 0xE05050,
  Alfheim:    0x4CAF50,
  Jotunheim:  0x1A8B8B,
}

// Mapa de conexões para desenhar as linhas
import { TERRITORIES_DATA } from '../data/territories'

interface TerritorySprite {
  container: PIXI.Container
  circle: PIXI.Graphics
  troopText: PIXI.Text
  troopBadge: PIXI.Graphics
}

export const Board: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const stageLayerRef = useRef<PIXI.Container | null>(null)
  const linesLayerRef = useRef<PIXI.Graphics | null>(null)
  const spritesRef = useRef<Record<string, TerritorySprite>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const territories = useGameStore((state) => state.territories)
  const players = useGameStore((state) => state.players)
  const phase = useGameStore((state) => state.phase)
  const activePlayerId = useGameStore((state) => state.activePlayerId)

  // ── Inicializa o Pixi UMA VEZ ──────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return

    const app = new PIXI.Application()
    app.init({
      width: 1024,
      height: 800,
      backgroundColor: 0x0d0a14,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      if (!canvasRef.current) return
      canvasRef.current.appendChild(app.canvas)
      appRef.current = app

      // Layer de linhas (abaixo dos territórios)
      const linesLayer = new PIXI.Graphics()
      app.stage.addChild(linesLayer)
      linesLayerRef.current = linesLayer

      // Layer de territórios (acima das linhas)
      const stageLayer = new PIXI.Container()
      app.stage.addChild(stageLayer)
      stageLayerRef.current = stageLayer
    })

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true })
        appRef.current = null
        stageLayerRef.current = null
        linesLayerRef.current = null
        spritesRef.current = {}
      }
    }
  }, []) // Só inicializa uma vez

  // ── Função que atualiza os sprites existentes ou cria novos ───────────────
  const renderTerritories = useCallback(() => {
    const app = appRef.current
    const stageLayer = stageLayerRef.current
    const linesLayer = linesLayerRef.current
    if (!app || !stageLayer || !linesLayer) return

    const terrs = useGameStore.getState().territories
    const allPlayers = useGameStore.getState().players
    const currentPhase = useGameStore.getState().phase
    const activeId = useGameStore.getState().activePlayerId
    const sel = selectedId

    // Desenha as conexões primeiro
    linesLayer.clear()
    const drawn = new Set<string>()
    TERRITORIES_DATA.forEach(t => {
      const src = terrs[t.id]
      if (!src?.coords) return
      t.connections.forEach(connId => {
        const key = [t.id, connId].sort().join('-')
        if (drawn.has(key)) return
        drawn.add(key)
        const dst = terrs[connId]
        if (!dst?.coords) return
        linesLayer.stroke({ width: 1, color: 0xffffff, alpha: 0.08 })
        linesLayer.moveTo(src.coords.x, src.coords.y)
        linesLayer.lineTo(dst.coords.x, dst.coords.y)
      })
    })

    // Atualiza/cria sprites de territórios
    Object.values(terrs).forEach((t: Territory) => {
      if (!t.coords) return

      const owner = allPlayers.find(p => p.id === t.ownerId)
      const baseColor = KINGDOM_COLORS[t.kingdom] || 0xC9A227
      const ownerColor = owner ? parseInt(owner.color.replace('#', ''), 16) : baseColor

      const isSelected = t.id === sel
      const isOwnedByMe = t.ownerId === activeId
      const isAdjacentToSelected = sel
        ? (TERRITORIES_DATA.find(d => d.id === sel)?.connections.includes(t.id) ?? false)
        : false

      // Determin highlight state
      let alpha = t.ownerId ? 0.55 : 0.25
      let strokeColor = t.ownerId ? ownerColor : baseColor
      let strokeWidth = 1.5
      let glow = false

      if (isSelected) {
        alpha = 1
        strokeColor = 0xFFD700
        strokeWidth = 3
        glow = true
      } else if (currentPhase === 'RECRUITMENT' && isOwnedByMe) {
        alpha = 0.75
        strokeWidth = 2
      } else if (currentPhase === 'ATTACK' && sel && isAdjacentToSelected && !isOwnedByMe) {
        alpha = 0.85
        strokeColor = 0xff4444
        strokeWidth = 2.5
      }

      if (spritesRef.current[t.id]) {
        // ── ATUALIZA sprite existente ──
        const { circle, troopText, troopBadge } = spritesRef.current[t.id]
        const container = spritesRef.current[t.id].container

        circle.clear()
        circle.fill({ color: ownerColor, alpha })
        circle.stroke({ width: strokeWidth, color: strokeColor, alpha: 0.9 })
        circle.circle(0, 0, 22)

        troopText.text = t.troops.toString()
        troopBadge.visible = t.troops > 0
        troopText.visible = t.troops > 0

        container.position.set(t.coords.x, t.coords.y)
      } else {
        // ── CRIA novo sprite ──
        const container = new PIXI.Container()
        container.position.set(t.coords.x, t.coords.y)

        // Círculo principal
        const circle = new PIXI.Graphics()
        circle.fill({ color: ownerColor, alpha })
        circle.stroke({ width: strokeWidth, color: strokeColor, alpha: 0.9 })
        circle.circle(0, 0, 22)
        container.addChild(circle)

        // Nome do território
        const nameText = new PIXI.Text({
          text: t.name,
          style: {
            fontFamily: 'Cinzel',
            fontSize: 9,
            fill: '#E8E0CC',
            dropShadow: { color: '#000000', blur: 4, distance: 0 }
          }
        })
        nameText.anchor.set(0.5)
        nameText.y = 32
        container.addChild(nameText)

        // Badge de tropas
        const troopBadge = new PIXI.Graphics()
        troopBadge.fill({ color: 0x111111, alpha: 0.9 })
        troopBadge.stroke({ width: 1.5, color: ownerColor, alpha: 0.8 })
        troopBadge.circle(16, -16, 11)
        troopBadge.visible = t.troops > 0
        container.addChild(troopBadge)

        const troopText = new PIXI.Text({
          text: t.troops.toString(),
          style: {
            fontFamily: 'Cinzel',
            fontSize: 11,
            fontWeight: 'bold',
            fill: '#FFFFFF',
          }
        })
        troopText.anchor.set(0.5)
        troopText.position.set(16, -16)
        troopText.visible = t.troops > 0
        container.addChild(troopText)

        // Interatividade
        container.interactive = true
        container.cursor = 'pointer'
        container.on('pointerover', () => { circle.alpha = 1 })
        container.on('pointerout', () => { circle.alpha = alpha })
        container.on('pointertap', () => {
          const state = useGameStore.getState()

          if (state.phase === 'RECRUITMENT') {
            if (t.ownerId === state.activePlayerId && (state.players.find(p => p.id === state.activePlayerId)?.troopsToDistribute ?? 0) > 0) {
              state.distributeTroops(t.id, 1)
            }
          } else if (state.phase === 'ATTACK') {
            if (t.ownerId === state.activePlayerId) {
              // Seleciona origem do ataque
              setSelectedId(t.id)
            } else if (sel && t.ownerId !== state.activePlayerId) {
              // Ataca: verifica se é adjacente ao selecionado
              const srcData = TERRITORIES_DATA.find(d => d.id === sel)
              if (srcData?.connections.includes(t.id)) {
                state.resolveCombat(sel, t.id, Math.min(3, (state.territories[sel]?.troops ?? 0) - 1))
                setSelectedId(null)
              }
            }
          } else if (state.phase === 'MOVEMENT') {
            if (!sel && t.ownerId === state.activePlayerId && t.troops > 1) {
              setSelectedId(t.id)
            } else if (sel && t.ownerId === state.activePlayerId) {
              const srcData = TERRITORIES_DATA.find(d => d.id === sel)
              if (srcData?.connections.includes(t.id)) {
                state.moveTroops(sel, t.id, Math.floor((state.territories[sel]?.troops ?? 0) / 2))
                setSelectedId(null)
              }
            }
          }
        })

        stageLayer.addChild(container)
        spritesRef.current[t.id] = { container, circle, troopText, troopBadge }
      }
    })
  }, [selectedId])

  // ── Re-renderiza quando o estado muda ────────────────────────────────────
  useEffect(() => {
    // Pequeno delay para garantir que o Pixi foi inicializado
    const timer = setTimeout(renderTerritories, 50)
    return () => clearTimeout(timer)
  }, [territories, players, phase, activePlayerId, selectedId, renderTerritories])

  return (
    <div className="board-wrapper">
      <div ref={canvasRef} className="pixi-container" />
      <style>{`
        .board-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background: var(--deep);
          overflow: auto;
        }
        .pixi-container {
          display: flex;
        }
        .pixi-container canvas {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  )
}
