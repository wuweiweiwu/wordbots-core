import { cloneDeep, isFunction, mapValues } from 'lodash';

import { TYPE_CORE } from '../constants';
import { clamp, applyFuncToField } from '../util/common.ts';
import {
  ownerOf, getHex,
  passTurn, drawCards, removeCardsFromHand,
  dealDamageToObjectAtHex, updateOrDeleteObjectAtHex, removeObjectFromBoard,
  executeCmd
} from '../util/game.ts';
import { splitSentences } from '../util/cards.ts';
import { moveObjectUsingAbility } from '../reducers/handlers/game/board';

export default function actions(state) {
  const iterateOver = collection => fn => {
    collection.entries.forEach(item => {
      item = reassignToKernelIfPlayer(item);  // always try to reassign targeting from player => kernel
      state.currentObjectInCollection = item;  // (Needed for tracking of targets.they)
      fn(item);
      state.currentObjectInCollection = undefined;
    });
  };

  const reassignToKernelIfPlayer = objectOrPlayer => {
    if (objectOrPlayer.robotsOnBoard) {
      // target is actually a player, so reassign target to be their kernel.
      return Object.values(objectOrPlayer.robotsOnBoard).find((obj) => obj.type === TYPE_CORE);
    } else {
      return objectOrPlayer;
    }
  };

  return {
    // Become a card. (becomeACopy takes a playedObject, this takes a card)
    become: function (sources, cards) {
      const card = cards.entries[0];
      iterateOver(sources)(source => {
        Object.assign(source,{
          card: cloneDeep(card),
          stats: cloneDeep(card.stats),
          abilities: [],
          triggers: []
        });
      });

      // Set triggers one-by-one.
      if (card.abilities && card.abilities.length > 0) {
        card.abilities.forEach((cmd, idx) => {
          const cmdText = splitSentences(card.text)[idx];
          state.currentCmdText = cmdText.includes('"') ? cmdText.split('"')[1].replace(/"/g, '') : cmdText;

          iterateOver(sources)(source => {
            executeCmd(state, cmd, source);
          });
        });
      }
    },

    // SOURCES become TARGET. keep for reference until become() really works well
    becomeACopy: function (sources, targets) {
      console.warn('actions.becomeACopy is deprecated as of wordbots-core 0.9.2');  // eslint-disable-line no-console
      const target = targets.entries[0]; // Unpack target.
      iterateOver(sources)(source => {
        Object.assign(source, {
          card: cloneDeep(target.card),
          stats: cloneDeep(target.stats),
          triggers: cloneDeep(target.triggers),
          abilities: cloneDeep(target.abilities)
        });
        updateOrDeleteObjectAtHex(state, source, getHex(state, source));
      });
    },

    canAttackAgain: function (objects) {
      iterateOver(objects)(object => {
        Object.assign(object, {cantAttack: false});
      });
    },

    canMoveAgain: function (objects) {
      iterateOver(objects)(object => {
        Object.assign(object, {movesMade: 0, cantMove: false});
      });
    },

    canMoveAndAttackAgain: function (objects) {
      iterateOver(objects)(object => {
        Object.assign(object, {movesMade: 0, cantMove: false, cantAttack: false});
      });
    },

    dealDamage: function (targets, amount) {
      iterateOver(targets)(target => {
        const hex = getHex(state, target);
        dealDamageToObjectAtHex(state, amount, hex);
      });
    },

    destroy: function (objects) {
      iterateOver(objects)(object => {
        object.isDestroyed = true;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object));
      });
    },

    discard: function (cards) {
      removeCardsFromHand(state, cards.entries);
    },

    draw: function (players, count) {
      players.entries.forEach(player => { drawCards(state, player, count); });
    },

    endTurn: function () {
      state = Object.assign(state, passTurn(state));
    },

    giveAbility: function (objects, abilityCmd) {
      iterateOver(objects)(object => {
        executeCmd(state, abilityCmd, object);
      });
    },

    modifyAttribute: function (objects, attr, func) {
      if (state.memory['duration']) {
        // Temporary attribute adjustment.
        iterateOver(objects)(object => {
          const targetFn = `() => objectsMatchingConditions('allobjects', [conditions['hasId']('${object.id}')])`;
          const abilityCmd = `() => { setAbility(abilities['attributeAdjustment']("${targetFn}", '${attr}', ${func})); }`;

          executeCmd(state, abilityCmd, object);
        });
      } else {
        // Permanent attribute adjustment.
        iterateOver(objects)(object => {
          if (attr === 'allattributes') {
            object.stats = mapValues(object.stats, clamp(func));
          } else if (attr === 'cost') {
            object.cost = clamp(func)(object.cost); // (This should only ever happen to cards in hand.)
          } else {
            object.stats = applyFuncToField(object.stats, func, attr);
          }
        });
      }
    },

    modifyEnergy: function (players, func) {
      players.entries.forEach(player => {
        player.energy = applyFuncToField(player.energy, func, 'available');
      });
    },

    moveObject: function (objects, hexes) {
      // Unpack.
      const [object, destHex] = [objects, hexes].map(t => t.entries[0]);

      if (object && destHex) {
        const startHex = getHex(state, object);
        moveObjectUsingAbility(state, startHex, destHex);
      }
    },

    payEnergy: function (players, amount) {
      players.entries.forEach(player => {
        if (player.energy.available >= amount) {
          player.energy.available -= amount;
        } else {
          state.invalid = true;
        }
      });
    },

    removeAllAbilities: function (objects) {
      iterateOver(objects)(object => {
        Object.assign(object, {
          card: Object.assign({}, object.card, {text: ''}),

          triggers: [],
          abilities: object.abilities.map(ability => ({...ability, disabled: true})),

          activatedAbilities: [],
          effects: [],
          temporaryStatAdjustments: []
        });
      });
    },

    restoreHealth: function (objects, num) {
      iterateOver(objects)(object => {
        if (object.stats.health < object.card.stats.health) {
          if (num) {
            object.stats.health = Math.min(object.card.stats.health, object.stats.health + num);
          } else {
            object.stats.health = object.card.stats.health;
          }
        }
      });
    },

    returnToHand: function (objects) {
      iterateOver(objects)(object => {
        const ownerName = ownerOf(state, object).name;
        const owner = state.players[ownerName];

        owner.hand = owner.hand.concat([object.card]);
        removeObjectFromBoard(state, object, getHex(state, object));
      });
    },

    setAttribute: function (objects, attr, num) {
      if (state.memory['duration']) {
        // Temporary attribute adjustment.
        this.modifyAttribute(objects, attr, `(function () { return ${num}; })`);
      } else {
        // Permanent attribute adjustment.
        iterateOver(objects)(object => {
          const value = isFunction(num) ? num(state) : num;  // num could be wrapped as a function of state (see targets.they)
          const target = {type: 'objects', entries: [object]};
          this.modifyAttribute(target, attr, () => value);
        });
      }
    },

    swapAttributes: function (objects, attr1, attr2) {
      iterateOver(objects)(object => {
        const [savedAttr1, savedAttr2] = [object.stats[attr1], object.stats[attr2]];
        object.stats[attr2] = savedAttr1;
        object.stats[attr1] = savedAttr2;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object));
      });
    },

    takeControl: function (players, objects) {
      const newOwner = players.entries[0]; // Unpack player.

      iterateOver(objects)(object => {
        const currentOwner = ownerOf(state, object);
        if (newOwner.name !== currentOwner.name) {
          const hex = getHex(state, object);

          newOwner.robotsOnBoard[hex] = object;
          delete currentOwner.robotsOnBoard[hex];
        }
      });
    }
  };
}
