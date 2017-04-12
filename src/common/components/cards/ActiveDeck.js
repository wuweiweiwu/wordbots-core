import React, { Component } from 'react';
import { array, func, string } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { sortBy } from 'lodash';

import { groupCards } from '../../util/cards';

// Widget representing the deck currently being created or modified.
export default class ActiveDeck extends Component {
  static propTypes = {
    id: string,
    cards: array,
    name: string,

    onCardClick: func,
    onSaveDeck: func
  }

  constructor(props) {
    super(props);

    this.state = {
      name: props.name
    };
  }

  render() {
    return (
      <div>
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>
          Deck&nbsp;
          <span style={{color: (this.props.cards.length === 30) ? 'green' : 'red'}}>
            [{this.props.cards.length}]
          </span>
        </div>

        <TextField
          value={this.state.name}
          floatingLabelText="Deck Name"
          style={{width: '100%', marginBottom: 10}}
          onChange={e => { this.setState({name: e.target.value}); }} />

        {sortBy(groupCards(this.props.cards), ['cost', 'name']).map((card, idx) =>
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              cursor: 'pointer',
              height: 30,
              marginBottom: -2,
              borderRadius: 5,
              border: card.source === 'builtin' ? '2px solid #444' : '2px solid #f44336'
            }}
            key={idx}
            onClick={() => this.props.onCardClick(card.id)}>
            <div style={{
              width: 30,
              color: 'white',
              fontFamily: 'Carter One',
              backgroundColor: '#00bcd4',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
              borderRight: card.source === 'builtin' ? '2px solid #444' : '2px solid #f44336'
            }}>{card.cost}</div>
            <div style={{
              width: 'calc(100% - 30px)',
              marginLeft: 5,
              display: 'flex',
              alignItems: 'center'
            }}>{card.name}</div>
            <div style={{
              width: 30,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>{card.count > 1 ? card.count : ''}</div>
          </div>
        )}

        <RaisedButton
          label="Save Deck"
          labelPosition="before"
          secondary
          disabled={this.state.name === '' || this.props.cards.length !== 30}
          icon={<FontIcon className="material-icons">save</FontIcon>}
          style={{width: '100%', marginTop: 20}}
          onClick={() => { this.props.onSaveDeck(this.props.id, this.state.name, this.props.cards.map(c => c.id)); }}
        />
      </div>
    );
  }
}
