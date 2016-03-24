import React, { Component, PropTypes } from 'react';

export default class SvgIcon extends Component {
  static propTypes = {
    icon: PropTypes.string.isRequired,
    size: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    style: React.PropTypes.object
  };

  static defaultProps = {
    size: 24
  };

  _mergeStyles(...args) {
    // This is the m function from "CSS in JS" and can be extracted to a mixin
    return Object.assign({}, ...args);
  }

  renderGraphic() {
    switch (this.props.icon) {
      case 'search':
        return (
          <g><path d="M15.5 14h-.79l-.28-.27c.98-1.14 1.57-2.62 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 2.91-6.5 6.5 2.91 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99 1.49-1.49-4.99-5zm-6 0c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/></g>
        );
      case 'close':
        return (
          <g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/></g>
        );
      case 'chevron-right':
        return (
          <g><path d="M10 6l-1.41 1.41 4.58 4.59-4.58 4.59 1.41 1.41 6-6z"/></g>
        );
      case 'cancel':
        return (
          <g><path d="M12 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10-4.47-10-10-10zm5 13.59l-1.41 1.41-3.59-3.59-3.59 3.59-1.41-1.41 3.59-3.59-3.59-3.59 1.41-1.41 3.59 3.59 3.59-3.59 1.41 1.41-3.59 3.59 3.59 3.59z"></path></g>
        );
    }
  }

  render() {
    const styles = {
      fill: "currentcolor",
      verticalAlign: "middle",
      width: this.props.size, // CSS instead of the width attr to support non-pixel units
      height: this.props.size // Prevents scaling issue in IE
    };
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        fit
        style={this._mergeStyles(styles, this.props.style)}
      >
        {this.renderGraphic()}
      </svg>
    );
  }
}