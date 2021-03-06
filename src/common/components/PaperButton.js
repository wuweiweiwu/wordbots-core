import * as React from 'react';
import { arrayOf, bool, element, func, object, oneOfType } from 'prop-types';
import Paper from '@material-ui/core/Paper';

export default class PaperButton extends React.Component {
  static propTypes = {
    disabled: bool,
    onClick: func,
    style: object,

    children: oneOfType([arrayOf(element), element])
  };

  constructor(props) {
    super(props);

    this.state = {
      shadow: 1
    };
  }

  onClick = () => {
    if (!this.props.disabled) {
      this.props.onClick();
    }
  }

  onMouseOver = () => {
    if (!this.props.disabled) {
      this.setState({shadow: 10});
    }
  }

  onMouseOut = () => {
    this.setState({shadow: 1});
  }

  render() {
    return (
      <Paper
        elevation={this.state.shadow}
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        style={Object.assign({cursor: this.props.disabled ? 'auto' : 'pointer'}, this.props.style)}
      >
        {this.props.children}
      </Paper>
    );
  }
}
