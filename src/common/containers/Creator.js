import React, { Component } from 'react';
import { array, bool, func, number, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';
import * as creatorActions from '../actions/creator';

export function mapStateToProps(state) {
  return {
    id: state.creator.id,
    name: state.creator.name,
    type: state.creator.type,
    attack: state.creator.attack,
    speed: state.creator.speed,
    health: state.creator.health,
    cost: state.creator.energy,
    spriteID: state.creator.spriteID,
    sentences: state.creator.sentences,
    setText: state.creator.setText,
    sidebarOpen: state.layout.present.sidebarOpen
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onSetName: (name) => {
      dispatch(creatorActions.setName(name));
    },
    onSetType: (type) => {
      dispatch(creatorActions.setType(type));
    },
    onSetText: (text) => {
      dispatch(creatorActions.setText(text));
    },
    onSetAttribute: (attr, value) => {
      dispatch(creatorActions.setAttribute(attr, value));
    },
    onParseComplete: (idx, sentence, result) => {
      dispatch(creatorActions.parseComplete(idx, sentence, result));
    },
    onSpriteClick: () => {
      dispatch(creatorActions.regenerateSprite());
    },
    onAddToCollection: (props) => {
      dispatch(creatorActions.addToCollection(props));
    }
  };
}

export class Creator extends Component {
  static propTypes = {
    id: string,
    name: string,
    type: number,
    setText: string,
    sentences: array,
    spriteID: string,
    attack: number,
    speed: number,
    health: number,
    cost: number,
    sidebarOpen: bool,

    history: object,

    onSetName: func,
    onSetType: func,
    onSetText: func,
    onSetAttribute: func,
    onParseComplete: func,
    onSpriteClick: func,
    onAddToCollection: func
  };

  // For testing.
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext() {
    return {muiTheme: getMuiTheme(baseTheme)};
  }

  render() {
    return (
      <div style={{height: '100%', paddingLeft: this.props.sidebarOpen ? 256 : 0}}>
        <Helmet title="Creator"/>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <CardCreationForm
            name={this.props.name}
            type={this.props.type}
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            energy={this.props.cost}
            sentences={this.props.sentences}
            setText={this.props.setText}
            isNewCard={this.props.id ? true : false}
            onSetName={(name) => { this.props.onSetName(name); }}
            onSetType={(type) => { this.props.onSetType(type); }}
            onSetText={(text) => { this.props.onSetText(text); }}
            onSetAttribute={(attr, value) => { this.props.onSetAttribute(attr, value); }}
            onParseComplete={(idx, sentence, json) => { this.props.onParseComplete(idx, sentence, json); }}
            onSpriteClick={() => { this.props.onSpriteClick(); }}
            onAddToCollection={() => {
              this.props.onAddToCollection(this.props);
              if (this.props.history) {
                this.props.history.push('/collection');
              }
            }} />
          <CardPreview
            name={this.props.name}
            type={this.props.type}
            spriteID={this.props.spriteID}
            sentences={this.props.sentences}
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            energy={this.props.cost}
            onSpriteClick={() => { this.props.onSpriteClick(); }} />
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Creator));
