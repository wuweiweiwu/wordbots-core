import * as React from 'react';
import { arrayOf, element, func, object, string } from 'prop-types';
import Button from '@material-ui/core/Button';

import { unpackDeck } from '../../util/cards.ts';
import { FORMATS } from '../../store/gameFormats.ts';
import RouterDialog from '../RouterDialog';

import DeckPicker from './DeckPicker';
import FormatPicker from './FormatPicker';

export default class PreGameModal extends React.Component {
  static propTypes = {
    availableDecks: arrayOf(object).isRequired,
    cards: arrayOf(object).isRequired,
    format: object,
    mode: string.isRequired,
    startButtonText: string,
    title: string,
    gameName: string,

    children: element,
    history: object.isRequired,

    onStartGame: func.isRequired
  };

  static defaultProps = {
    startButtonText: 'Start Game'
  }

  state = {
    selectedDeckIdx: 0,
    selectedFormatIdx: 0
  };

  get format() {
    const { format } = this.props;
    const { selectedFormatIdx } = this.state;
    return format || FORMATS[selectedFormatIdx];
  }

  get validDecks() {
    const { availableDecks, cards } = this.props;
    return availableDecks.map(deck => unpackDeck(deck, cards)).filter(this.format.isDeckValid);
  }

  /* The currently selected deck, in its raw form. */
  get deck() {
    const { selectedDeckIdx } = this.state;
    return this.validDecks[selectedDeckIdx];
  }

  /* The currently selected deck, in a form ready to start a game with. */
  get deckForGame() {
    return unpackDeck(this.deck, this.props.cards);
  }

  get actions() {
    const { mode, gameName } = this.props;
    return [
      <Button
        key="cancel"
        variant="outlined"
        onTouchTap={this.close}
        style={{ marginRight: 10 }}>
        Cancel
      </Button>,
      <Button
        key="start"
        variant="raised"
        color="secondary"
        disabled={gameName === '' && mode === 'host'}
        onTouchTap={this.handleStartGame}>
        {this.props.startButtonText}
      </Button>
    ];
  }

  close = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  handleChooseFormat = (selectedFormatIdx) => {
    this.setState({ selectedFormatIdx, selectedDeckIdx: 0 });
  }

  handleChooseDeck = (selectedDeckIdx) => {
    this.setState({ selectedDeckIdx });
  }

  handleStartGame = () => {
    this.props.onStartGame(this.format.name, this.deckForGame);
    this.close();
  };

  render() {
    const { cards, children, format, history, mode, title } = this.props;
    const { selectedDeckIdx, selectedFormatIdx } = this.state;

    return (
      <RouterDialog
        modal
        path={mode}
        title={title}
        history={history}
        style={{
          width: 450
        }}
        actions={this.actions}
      >
        {children}
        {format ? null : <FormatPicker
          selectedFormatIdx={selectedFormatIdx}
          onChooseFormat={this.handleChooseFormat}
        />}
        <DeckPicker
          cards={cards}
          availableDecks={this.validDecks}
          selectedDeckIdx={selectedDeckIdx}
          onChooseDeck={this.handleChooseDeck} />
      </RouterDialog>
    );
  }
}
