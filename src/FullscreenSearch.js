import React, { Component } from 'react';
import Bloodhound from 'bloodhound-js';

require('./FullscreenSearch.less');

export default class FullscreenSearch extends Component {

  constructor(props) {
    super(props);

    var engine = new Bloodhound({
      local: ['dog', 'pig', 'moose'],
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      datumTokenizer: Bloodhound.tokenizers.whitespace
    });

    var promise = engine.initialize();

    promise.then(function() {
      console.log('engine init done');

      engine.search('d', function(d) {
        console.log(d);
      }, function(d) {
        console.log(d);
      });
    });
  }

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
