import { getHex, getAttribute } from '../util';
import Hex from '../components/react-hexgrid/Hex';
import HexUtils from '../components/react-hexgrid/HexUtils';

// Conditions are all (hex, obj) -> bool functions.
// They are used by the objectsMatchingConditions() collection.

export default function conditions(state) {
  return {
    adjacentTo: function (objects) {
      if (objects.length > 0) {
        // Hex target is always in the form of list of objects, so just unpack it.
        // TODO do we want to handle the case where objects has more than one entry?
        const targetObj = objects[0];
        const targetHex = HexUtils.IDToHex(getHex(state, targetObj));

        const neighbors = [
          new Hex(targetHex.q, targetHex.r - 1, targetHex.s + 1),
          new Hex(targetHex.q, targetHex.r + 1, targetHex.s - 1),
          new Hex(targetHex.q - 1, targetHex.r + 1, targetHex.s),
          new Hex(targetHex.q + 1, targetHex.r - 1, targetHex.s),
          new Hex(targetHex.q - 1, targetHex.r, targetHex.s + 1),
          new Hex(targetHex.q + 1, targetHex.r, targetHex.s - 1)
        ].map(HexUtils.getID);

        return ((hex, obj) => neighbors.includes(hex));
      } else {
        // objects is empty, so nothing is adjacent - return false for all candidates.
        return ((hex, obj) => false);
      }
    },

    attributeComparison: function (attr, comp) {
      return ((hex, obj) => comp(getAttribute(obj, attr)));
    },

    controlledBy: function (players) {
      const player = players[0]; // Player target is always in the form of list, so just unpack it.
      return ((hex, obj) => _.has(player.robotsOnBoard, hex));
    }
  };
}
