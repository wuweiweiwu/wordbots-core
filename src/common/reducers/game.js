import { cloneDeep, isArray, reduce } from 'lodash';

import { DEFAULT_GAME_FORMAT } from '../constants';
import { id } from '../util/common.ts';
import { triggerSound } from '../util/game.ts';
import * as actions from '../actions/game';
import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultGameState.ts';

import g from './handlers/game';

const PURELY_VISUAL_ACTIONS = [actions.ATTACK_RETRACT, actions.ATTACK_COMPLETE];

export default function game(state = cloneDeep(defaultState), action, allowed = false) {
  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, game, state);
  } else if (state.tutorial && !allowed) {
    // In tutorial mode, only one specific action is allowed at any given time.
    return g.handleTutorialAction(state, action);
  } else {
    return handleAction(state, action);
  }
}

export function handleAction(oldState, { type, payload }) {
  let state = Object.assign({}, oldState);

  if (!PURELY_VISUAL_ACTIONS.includes(type)) {
    state = Object.assign(state, {
      actionId: id()  // actionId is used to correctly merge actions in the action log.
    });
  }

  switch (type) {
    case socketActions.GAME_START:
      return g.newGame(
        state,
        payload.player || 'orange',
        payload.usernames || {},
        payload.decks,
        payload.seed,
        payload.format || DEFAULT_GAME_FORMAT
      );

    case actions.START_TUTORIAL:
      return g.startTutorial(state);

    case actions.START_PRACTICE:
      return g.startPractice(state, payload.format, payload.deck);

    case actions.START_SANDBOX:
      return g.startSandbox(state, payload.card);

    case actions.AI_RESPONSE:
      return g.aiResponse(state);

    case actions.END_GAME:
      return Object.assign(state, {started: false});

    case actions.MOVE_ROBOT:
      return g.moveRobot(state, payload.from, payload.to);

    case actions.ATTACK:
      return g.attack(state, payload.source, payload.target);

    case actions.ATTACK_RETRACT:
      return Object.assign(state, {attack: {...state.attack, retract: true}});

    case actions.ATTACK_COMPLETE:
      return g.attackComplete(state);

    case actions.ACTIVATE_OBJECT:
      return g.activateObject(state, payload.abilityIdx);

    case actions.PLACE_CARD:
      return g.placeCard(state, payload.cardIdx, payload.tile);

    case actions.PASS_TURN:
      return g.passTurn(state, payload.player);

    case actions.SET_SELECTED_CARD:
      return g.setSelectedCard(state, payload.player, payload.selectedCard);

    case actions.SET_SELECTED_TILE:
      return g.setSelectedTile(state, payload.player, payload.selectedTile);

    case actions.DESELECT:
      return g.deselect(state, payload.player);

    case actions.ADD_CARD_TO_TOP_OF_DECK: {
      // Only to be used in sandbox mode.
      const { player } = payload;
      const card = { ...payload.card, id: id() };
      state.players[player].deck.unshift(card);
      return state;
    }

    case socketActions.CONNECTING:
      return Object.assign(state, {started: false});

    case socketActions.CURRENT_STATE:
      // This is used for spectating an in-progress game - the server sends back a log of all actions so far.
      return reduce(payload.actions, game, state);

    case socketActions.FORFEIT: {
      state = Object.assign(state, {winner: payload.winner});
      state = triggerSound(state, state.winner === state.player ? 'win.wav' : 'lose.wav');
      return state;
    }

    default:
      return oldState;
  }
}
