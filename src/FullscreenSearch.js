import React, { Component } from 'react';

require('./FullscreenSearch.less');

export default class FullscreenSearch extends Component {

  state = {
    enteredQuery: '',
    results: [
      {
        name: 'Some result name'
      },
      {
        name: 'Some result name'
      }
    ]
  };

  handleInputChange(event) {
    this.setState({ enteredQuery: event.target.value });
  }

  render() {
    const {
      results
    } = this.state;

    return (
      <div className="FullscreenSearch">
        <input
          className="FullscreenSearch__input"
          placeholder="Search..."
          value={this.state.enteredQuery}
          onChange={this.handleInputChange.bind(this)}
        />
        <div className="FullscreenSearch__results">
          {results.map(result =>
            <div className="FullscreenSearch__result">
              <div className="FullscreenSearch__result-name">{result.name}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
