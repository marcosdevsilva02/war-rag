import { create } from 'zustand'
import { TERRITORIES_DATA, KINGDOMS_DATA } from '../data/territories'

export type GamePhase = 'RECRUITMENT' | 'ATTACK' | 'MOVEMENT' | 'CARDS' | 'WAITING'

export interface Territory {
  id: string
  name: string
  kingdom: string
  ownerId: string | null
  troops: number
  connections: string[] // IDs of adjacent territories
  coords: { x: number, y: number }
}

export interface Player {
  id: string
  name: string
  faction: string
  color: string
  troopsToDistribute: number
}

interface GameState {
  matchId: string | null
  phase: GamePhase
  turn: number
  activePlayerId: string | null
  players: Player[]
  territories: Record<string, Territory>
  
  // Actions
  setMatchId: (id: string) => void
  setPhase: (phase: GamePhase) => void
  nextPhase: () => void  // Logical transition to next phase
  nextTurn: () => void
  updateTerritory: (id: string, updates: Partial<Territory>) => void
  addPlayer: (player: Player) => void
  endTurn: () => void
  startGame: (players: Player[]) => void
  calculateRecruitment: (playerId: string) => number
  distributeTroops: (territoryId: string, count: number) => void
  
  // Gameplay Actions
  moveTroops: (fromId: string, toId: string, count: number) => void
  resolveCombat: (attackerId: string, defenderId: string, attackerCount: number) => { attackerLosses: number, defenderLosses: number }
}

export const useGameStore = create<GameState>((set) => ({
  matchId: null,
  phase: 'WAITING',
  turn: 1,
  activePlayerId: null,
  players: [],
  territories: TERRITORIES_DATA.reduce((acc, t) => ({
    ...acc,
    [t.id]: { ...t, ownerId: null, troops: 1 } // Initial neutro state
  }), {}),

  setMatchId: (id) => set({ matchId: id }),
  setPhase: (phase) => set({ phase }),
  
  nextPhase: () => set((state) => {
    const phases: GamePhase[] = ['RECRUITMENT', 'ATTACK', 'MOVEMENT', 'CARDS']
    const currentIndex = phases.indexOf(state.phase)
    const nextIndex = (currentIndex + 1) % phases.length
    
    if (nextIndex === 0) {
      // Logic for moving to the next player's turn should go here in a real scenario
      return { phase: phases[nextIndex], turn: state.turn + 1 }
    }
    
    return { phase: phases[nextIndex] }
  }),

  nextTurn: () => set((state) => ({ turn: state.turn + 1 })),
  
  endTurn: () => set((state) => ({
    phase: 'RECRUITMENT',
    turn: state.turn + 1,
    // activePlayerId: nextPlayerId ...
  })),

  updateTerritory: (id, updates) => set((state) => ({
    territories: {
      ...state.territories,
      [id]: { ...state.territories[id], ...updates }
    }
  })),
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),

  moveTroops: (fromId, toId, count) => set((state) => {
    const from = state.territories[fromId]
    const to = state.territories[toId]
    if (!from || !to || from.ownerId !== to.ownerId || from.troops <= count) return state
    
    return {
      territories: {
        ...state.territories,
        [fromId]: { ...from, troops: from.troops - count },
        [toId]: { ...to, troops: to.troops + count }
      }
    }
  }),


  resolveCombat: (attackerId, defenderId, attackerCount) => set((state) => {
    const attacker = state.territories[attackerId]
    const defender = state.territories[defenderId]
    if (!attacker || !defender) return state
    if (attacker.troops <= 1) return state  // Precisa de pelo menos 2 tropas para atacar

    // Rola os dados
    const numAttDice = Math.min(Math.min(attackerCount, 3), attacker.troops - 1)
    const numDefDice = Math.min(2, defender.troops)

    const attackerRolls = Array.from({ length: numAttDice }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a)
    const defenderRolls = Array.from({ length: numDefDice }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a)

    let attackerLosses = 0
    let defenderLosses = 0

    for (let i = 0; i < Math.min(attackerRolls.length, defenderRolls.length); i++) {
      if (attackerRolls[i] > defenderRolls[i]) defenderLosses++
      else attackerLosses++
    }

    const newAttackerTroops = attacker.troops - attackerLosses
    const newDefenderTroops = defender.troops - defenderLosses

    // Aplica resultado
    if (newDefenderTroops <= 0) {
      // ── Conquista! ──
      const troopsMoving = Math.max(1, numAttDice)
      return {
        territories: {
          ...state.territories,
          [attackerId]: { ...attacker, troops: newAttackerTroops - troopsMoving },
          [defenderId]: { ...defender, ownerId: attacker.ownerId, troops: troopsMoving }
        }
      }
    } else {
      // ── Batalha sem conquista ──
      return {
        territories: {
          ...state.territories,
          [attackerId]: { ...attacker, troops: Math.max(1, newAttackerTroops) },
          [defenderId]: { ...defender, troops: newDefenderTroops }
        }
      }
    }
  }),

  startGame: (players) => set((state) => {
    // 1. Shuffle territories
    const shuffled = [...TERRITORIES_DATA].sort(() => Math.random() - 0.5)
    
    // 2. Distribute among players
    const newTerritories: Record<string, Territory> = {}
    shuffled.forEach((t, index) => {
      const owner = players[index % players.length]
      newTerritories[t.id] = {
        ...t,
        ownerId: owner.id,
        troops: 1
      }
    })

    // Temporary state to calculate recruitment
    const tempState = { ...state, territories: newTerritories, players }
    
    // We can't call calculateRecruitment directly here because it's part of the store
    // Let's use the logic directly or a helper
    const playerTerritories = Object.values(newTerritories).filter(t => t.ownerId === players[0].id)
    let firstPlayerRecruitment = Math.max(3, Math.floor(playerTerritories.length / 3))
    
    const ownedCountByKingdom: Record<string, number> = {}
    playerTerritories.forEach(t => {
      ownedCountByKingdom[t.kingdom] = (ownedCountByKingdom[t.kingdom] || 0) + 1
    })

    Object.entries(KINGDOMS_DATA).forEach(([kingdom, data]) => {
      if (ownedCountByKingdom[kingdom] === data.territories) {
        firstPlayerRecruitment += data.bonus
      }
    })

    const updatedPlayers = players.map((p, i) => i === 0 ? { ...p, troopsToDistribute: firstPlayerRecruitment } : p)

    // 3. Initial state
    return {
      players: updatedPlayers,
      territories: newTerritories,
      activePlayerId: players[0].id,
      phase: 'RECRUITMENT',
      turn: 1
    }
  }),

  distributeTroops: (territoryId, count) => set((state) => {
    const territory = state.territories[territoryId]
    const player = state.players.find(p => p.id === state.activePlayerId)
    
    if (!territory || !player || territory.ownerId !== state.activePlayerId || player.troopsToDistribute < count) return state
    
    return {
      territories: {
        ...state.territories,
        [territoryId]: { ...territory, troops: territory.troops + count }
      },
      players: state.players.map(p => p.id === player.id ? { ...p, troopsToDistribute: p.troopsToDistribute - count } : p)
    }
  }),

  calculateRecruitment: (playerId) => {
    const state = useGameStore.getState()
    const playerTerritories = Object.values(state.territories).filter(t => t.ownerId === playerId)
    
    // Base: 1 troop for every 3 territories (min 3)
    let amount = Math.max(3, Math.floor(playerTerritories.length / 3))
    
    // Kingdom Bonuses
    const ownedCountByKingdom: Record<string, number> = {}
    playerTerritories.forEach(t => {
      ownedCountByKingdom[t.kingdom] = (ownedCountByKingdom[t.kingdom] || 0) + 1
    })

    Object.entries(KINGDOMS_DATA).forEach(([kingdom, data]) => {
      if (ownedCountByKingdom[kingdom] === data.territories) {
        amount += data.bonus
      }
    })

    return amount
  }
}))
