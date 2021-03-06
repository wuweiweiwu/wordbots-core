import * as React from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';

import { id } from '../../util/common.ts';
import { inBrowser } from '../../util/browser.tsx';
import { splitSentences } from '../../util/cards.ts';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

export default class CardGrid extends React.Component {
  static propTypes = {
    cards: arrayOf(object),
    selectedCardIds: arrayOf(string),
    selectable: bool,

    onCardClick: func
  };

  renderCard = (card) => (
    <div
      key={card.id || id()}
      style={{
        marginRight: 15,
        marginTop: -12
    }}>
      <Card
        collection
        id={card.id}
        name={card.name}
        spriteID={card.spriteID}
        spriteV={card.spriteV}
        type={card.type}
        text={splitSentences(card.text).map(Sentence)}
        rawText={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source}
        selected={this.props.selectable && this.props.selectedCardIds.includes(card.id)}
        onCardClick={this.props.onCardClick} />
    </div>
  );

  render() {
    return (
      <div style={{
        width: 'calc(100% - 40px)',
        margin: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>{!inBrowser() ? null : this.props.cards.map(this.renderCard)}</div>
      </div>
    );
  }
}

