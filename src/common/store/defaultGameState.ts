import * as w from '../types';
import { BLUE_CORE_HEX, ORANGE_CORE_HEX, TYPE_CORE } from '../constants';

import * as cards from './cards';

const STARTING_PLAYER = 'orange';

export function bluePlayerState(collection: w.Card[]): w.PlayerInGameState {
  return playerState('blue', collection, cards.blueCoreCard, BLUE_CORE_HEX);
}

export function orangePlayerState(collection: w.Card[]): w.PlayerInGameState {
  return playerState('orange', collection, cards.orangeCoreCard, ORANGE_CORE_HEX);
}

export function arbitraryPlayerState(): w.PlayerInGameState {
  return bluePlayerState([]);
}

function playerState(color: w.PlayerColor, collection: w.Card[], coreCard: w.CardInGame, coreHexId: string): w.PlayerInGameState {
  return {
    name: color,
    energy: {
      available: (color === STARTING_PLAYER) ? 1 : 0,
      total: (color === STARTING_PLAYER) ? 1 : 0
    },
    hand: collection.slice(0, 2),
    deck: collection.slice(2),
    discardPile: [],
    collection,
    robotsOnBoard: {
      [coreHexId]: {
        id: `${color}Core`,
        type: TYPE_CORE,
        card: coreCard,
        stats: Object.assign({}, coreCard.stats),
        movesMade: 0,
        triggers: [],
        abilities: []
      }
    },
    selectedCard: null,
    selectedTile: null,
    status: {
      message: '',
      type: ''
    },
    target: {
      choosing: false,
      chosen: null,
      possibleCards: [],
      possibleHexes: []
    }
  };
}

const defaultState: w.GameState = {
  storeKey: 'game',
  players: {
    blue: bluePlayerState([]),
    orange: orangePlayerState([])
  },
  gameFormat: 'normal',
  started: false,
  tutorial: false,
  practice: false,
  sandbox: false,
  winner: null,
  currentTurn: STARTING_PLAYER,
  player: STARTING_PLAYER,
  usernames: {},
  hoveredCard: null,
  actionLog: [],
  attack: null,
  memory: {},
  sfxQueue: [],
  eventQueue: [],
  rng: Math.random
};

export default defaultState;
