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
  cards: TerritoryCard[]
  mission: string
  conqueredThisTurn: boolean
  isEliminated: boolean
}

export type CardSymbol = 'KNIGHT' | 'WIZARD' | 'ARCHER' | 'WILD'

export interface TerritoryCard {
  id: string
  territoryId: string | 'WILD'
  symbol: CardSymbol
}

interface GameState {
  matchId: string | null
  phase: GamePhase
  turn: number
  activePlayerId: string | null
  players: Player[]
  territories: Record<string, Territory>
  winnerId: string | null
  deck: TerritoryCard[]
  cardTradeCount: number
  
  // Actions
  setMatchId: (id: string) => void
  setPhase: (phase: GamePhase) => void
  nextPhase: () => void
  nextTurn: () => void
  updateTerritory: (id: string, updates: Partial<Territory>) => void
  addPlayer: (player: Player) => void
  endTurn: () => void
  startGame: (players: Player[]) => void
  calculateRecruitment: (playerId: string) => number
  distributeTroops: (territoryId: string, count: number) => void
  
  // Gameplay Actions
  moveTroops: (fromId: string, toId: string, count: number) => void
  resolveCombat: (attackerId: string, defenderId: string, attackerCount: number) => void
  tradeCards: (cardIds: string[]) => void
  drawCard: (playerId: string) => void
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
  winnerId: null,
  deck: [],
  cardTradeCount: 0,

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
  
  endTurn: () => set((state) => {
    // 1. Draw card if player conquered something
    const activePlayer = state.players.find(p => p.id === state.activePlayerId)
    let newState: Partial<GameState> = {}
    
    if (activePlayer?.conqueredThisTurn && state.deck.length > 0) {
      const card = state.deck[0]
      newState.deck = state.deck.slice(1)
      newState.players = state.players.map(p => 
        p.id === state.activePlayerId 
          ? { ...p, cards: [...p.cards, card], conqueredThisTurn: false } 
          : p
      )
    } else if (activePlayer) {
      newState.players = state.players.map(p => 
        p.id === state.activePlayerId ? { ...p, conqueredThisTurn: false } : p
      )
    }

    // 2. Next player
    const currentIndex = state.players.findIndex(p => p.id === state.activePlayerId)
    let nextIndex = (currentIndex + 1) % state.players.length
    
    // Skip eliminated players
    while (state.players[nextIndex].isEliminated && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % state.players.length
    }

    return {
      ...newState,
      phase: 'RECRUITMENT',
      turn: nextIndex === 0 ? state.turn + 1 : state.turn,
      activePlayerId: state.players[nextIndex].id
    }
  }),

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
      const oldOwnerId = defender.ownerId
      const newTerritories = {
        ...state.territories,
        [attackerId]: { ...attacker, troops: newAttackerTroops - troopsMoving },
        [defenderId]: { ...defender, ownerId: attacker.ownerId, troops: troopsMoving }
      }

      // --- Checa Vitória e Eliminação ---
      const attackerTerritoriesCount = Object.values(newTerritories).filter(t => t.ownerId === attacker.ownerId).length
      
      // Checa se o defensor foi eliminado
      let newPlayers = state.players.map(p => {
        if (p.id === attacker.ownerId) return { ...p, conqueredThisTurn: true }
        return p
      })

      if (oldOwnerId) {
        const defenderTerritoriesCount = Object.values(newTerritories).filter(t => t.ownerId === oldOwnerId).length
        if (defenderTerritoriesCount === 0) {
          // Jogador eliminado
          newPlayers = newPlayers.map(p => p.id === oldOwnerId ? { ...p, isEliminated: true } : p)
          
          // --- Transferência de Cartas ao eliminar ---
          const eliminatedPlayer = state.players.find(p => p.id === oldOwnerId)
          if (eliminatedPlayer && eliminatedPlayer.cards.length > 0) {
            newPlayers = newPlayers.map(p => 
              p.id === attacker.ownerId 
                ? { ...p, cards: [...p.cards, ...eliminatedPlayer.cards] } 
                : p.id === oldOwnerId ? { ...p, cards: [] } : p
            )
          }
        }
      }

      // Checa vitória por territórios (24) ou por ser o último sobrevivente
      let winnerId = state.winnerId
      const activePlayers = newPlayers.filter(p => !p.isEliminated)
      if (attackerTerritoriesCount >= 24 || activePlayers.length === 1) {
        winnerId = attacker.ownerId
      }

      return {
        territories: newTerritories,
        players: newPlayers,
        winnerId
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

  startGame: (players) => set(() => {
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

    // --- MISSÕES SECRETAS ---
    const MISSIONS = [
      "Conquistar 24 territórios à sua escolha",
      "Conquistar Midgard e Niflheim",
      "Conquistar Asgard e Muspelheim",
      "Conquistar Alfheim, Jotunheim e mais um reino à escolha",
      "Eliminar o jogador de cor Vermelha (ou conquistar 24 territórios se você for o Vermelho ou ele já tiver sido eliminado)",
      "Eliminar o jogador de cor Azul (ou conquistar 24 territórios se você for o Azul ou ele já tiver sido eliminado)",
    ]

    const updatedPlayers = players.map((p, i) => ({
      ...p,
      cards: [],
      conqueredThisTurn: false,
      isEliminated: false,
      mission: MISSIONS[i % MISSIONS.length],
      troopsToDistribute: i === 0 ? firstPlayerRecruitment : 0
    }))

    // --- BARALHO DE TERRITÓRIOS ---
    const symbols: CardSymbol[] = ['KNIGHT', 'WIZARD', 'ARCHER']
    const deck: TerritoryCard[] = TERRITORIES_DATA.map((t, i) => ({
      id: `card-${t.id}`,
      territoryId: t.id,
      symbol: symbols[i % 3]
    }))
    // Add 2 wild cards
    deck.push({ id: 'card-wild-1', territoryId: 'WILD', symbol: 'WILD' })
    deck.push({ id: 'card-wild-2', territoryId: 'WILD', symbol: 'WILD' })
    
    // Shuffle deck
    const shuffledDeck = deck.sort(() => Math.random() - 0.5)

    // 3. Initial state
    return {
      players: updatedPlayers,
      territories: newTerritories,
      activePlayerId: players[0].id,
      phase: 'RECRUITMENT',
      turn: 1,
      deck: shuffledDeck,
      cardTradeCount: 0,
      winnerId: null
    }
  }),

  drawCard: (playerId) => set((state) => {
    if (state.deck.length === 0) return state
    const card = state.deck[0]
    return {
      deck: state.deck.slice(1),
      players: state.players.map(p => p.id === playerId ? { ...p, cards: [...p.cards, card] } : p)
    }
  }),

  tradeCards: (cardIds) => set((state) => {
    const player = state.players.find(p => p.id === state.activePlayerId)
    if (!player || cardIds.length !== 3) return state

    const selectedCards = player.cards.filter(c => cardIds.includes(c.id))
    if (selectedCards.length !== 3) return state

    // Logic for valid sets: 3 same or 3 different
    const symbols = selectedCards.map(c => c.symbol)
    const distinctSymbols = new Set(symbols.filter(s => s !== 'WILD'))
    const wildCount = symbols.filter(s => s === 'WILD').length

    let isValid = false
    if (wildCount >= 1) {
      isValid = true // Any pair + wild or single + 2 wilds is valid in most rules
    } else if (distinctSymbols.size === 1 || distinctSymbols.size === 3) {
      isValid = true
    }

    if (!isValid) return state

    // Calculate bonus: 4, 6, 8, 10, 12, 15, 20, 25...
    const tradeSequence = [4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50]
    const bonus = tradeSequence[Math.min(state.cardTradeCount, tradeSequence.length - 1)]

    // Bonus for owning territory on card (+2)
    let territoryBonus = 0
    let bonusTerritoryId = ""
    selectedCards.forEach(c => {
      if (c.territoryId !== 'WILD' && state.territories[c.territoryId].ownerId === player.id) {
        territoryBonus = 2
        bonusTerritoryId = c.territoryId
      }
    })

    const updatedTerritories = { ...state.territories }
    if (bonusTerritoryId) {
      updatedTerritories[bonusTerritoryId] = {
        ...updatedTerritories[bonusTerritoryId],
        troops: updatedTerritories[bonusTerritoryId].troops + territoryBonus
      }
    }

    return {
      cardTradeCount: state.cardTradeCount + 1,
      players: state.players.map(p => p.id === player.id 
        ? { ...p, troopsToDistribute: p.troopsToDistribute + bonus, cards: p.cards.filter(c => !cardIds.includes(c.id)) } 
        : p
      ),
      territories: updatedTerritories,
      deck: [...state.deck, ...selectedCards] // Return cards to bottom of deck
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
