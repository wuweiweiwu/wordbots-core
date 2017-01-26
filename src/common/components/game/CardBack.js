import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';

class CardBack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let style = {};

    if (this.props.deckLength) {
      style = {
        borderBottom: 'solid #444',
        borderBottomWidth: Math.min((this.props.deckLength - 1) * 2, 16)
      }
    }

    return (
      <div>
        <Paper
          zDepth={2}
          style={Object.assign({
            width: 140,
            height: 200,
            marginRight: 10,
            borderRadius: 5,
            backgroundColor: '#f44336',
            boxSizing: 'border-box',
            padding: 5,
            userSelect: 'none',
            cursor: 'pointer'
        }, style)}>
          <div style={{
            writingMode: 'vertical-lr',
            width: 'calc(100% - 4px)',
            height: 'calc(100% - 4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            border: '2px solid #FFF'
          }}>
            <div style={{
              color: '#fff',
              fontSize: 28,
              fontFamily: 'Luckiest Guy'
            }}>WordBots</div>
          </div>
        </Paper>
      </div>
    )
  }
}

CardBack.propTypes = {
  deckLength: React.PropTypes.number
}

export default CardBack;