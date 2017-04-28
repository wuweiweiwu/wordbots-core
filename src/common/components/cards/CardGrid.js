import React, { Component } from 'react';
import { array, bool, func } from 'prop-types';

import { inBrowser } from '../../util/common';
import { splitSentences } from '../../util/cards';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

export default class CardGrid extends Component {
  static propTypes = {
    cards: array,
    selectedCardIds: array,
    selectable: bool,

    onCardClick: func
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1
    };
  }

  renderCard(card) {
    return (
      <div
        key={card.id}
        style={{
          marginRight: 15,
          marginTop: -12
      }}>
        <Card
          collection
          id={card.id}
          name={card.name}
          spriteID={card.spriteID}
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
  }

  render() {
    return (
      <div style={{
        width: 'calc(100% - 10px)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>{!inBrowser() ? null : this.props.cards.map(this.renderCard.bind(this))}</div>
      </div>
    );
  }
}

