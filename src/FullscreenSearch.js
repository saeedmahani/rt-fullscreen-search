import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Bloodhound from 'bloodhound-js';
import cx from 'classnames';
import SvgIcon from './SvgIcon.js';
const _groupBy = require('lodash/groupBy');

require('./FullscreenSearch.less');

const resultsPerCategory = 5;

export default class FullscreenSearch extends Component {

  movieRelativeUrlForVanity(vanity) {
    return `/m/${vanity}`;
  }

  actorRelativeUrlForVanity(vanity) {
    return `/celebrity/${vanity}`;
  }

  allSearchResultsRelativeUrlForQuery(query) {
    return `/search/?search=${query}`;
  }

  constructor(props) {
    super(props);

    this.engine = new Bloodhound({
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: `http://www.rottentomatoes.com/search/json/?catCount=${resultsPerCategory}&q=%QUERY`,
        wildcard: '%QUERY',
        transform: ({ movies = [], tvResults:tv = [], actors = []}) => ([
          ...movies.map(m => ({
            ...m,
            type: 'movie',
            url: this.movieRelativeUrlForVanity(m.vanity),
            line1: `${m.name}`,
            line2: `${m.subline}`,
            yearLine: `${m.year ? `(${m.year})` : ''}`
          })),
          ...tv.map(t => ({
            ...t,
            type: 'tv',
            line1: `${t.name}`,
            line2: `${t.subline}`,
            yearLine: `${t.startYear ? `(${t.startYear} - ${t.endYear || ' '})` : ''}`
          })),
          ...actors.map(a => ({
            ...a,
            type: 'actor',
            url: this.actorRelativeUrlForVanity(a.vanity),
            line1: `${a.name}`
          }))
        ])
      }
    });

    this.promise = this.engine.initialize();
  }

  state = {
    enteredQuery: '',
    selectedResult: null,
    results: [],
    isFetchingResultsAsync: false
  };

  updateResults(results) {
    this.setState({ results, selectedResult: null });
  }

  close() {
    ReactDOM.unmountComponentAtNode(document.getElementById('fullscreen-search-root'));
  }

  handleInputChange(event) {
    const query = event.target.value;
    this.setState({ enteredQuery: query });
    this.setState({ isFetchingResultsAsync: true });
    this.promise
      .then(() => {
        this.engine.search(query, d => {
          console.info('updating results SYNC', d);
          this.updateResults(d);
        }, d => {
          console.info('updating results ASYNC', d);
          this.updateResults(d);
          this.setState({ isFetchingResultsAsync: query !== this.state.enteredQuery })
        });
      })
      .catch(error => {
        console.error('caught error!:', error);
      });
  }

  selectResult(result) {
    const { results } = this.state;
    if (!results.length) {
      return;
    }
    // whether result is null or not, set it
    this.setState({ selectedResult: result });
  }

  selectNext() {
    const { results, selectedResult } = this.state;
    if (!results.length) {
      return;
    }
    if (!selectedResult) {
      this.selectResult(results[0]);
      return;
    }
    const index = results.indexOf(selectedResult);
    const nextResult = index < results.length ? results[index + 1] : null;
    this.selectResult(nextResult);
  }

  selectPrevious() {
    const { results, selectedResult } = this.state;
    if (!results.length) {
      return;
    }
    if (!selectedResult) {
      this.selectResult(results[results.length - 1]);
      return;
    }
    const index = results.indexOf(selectedResult);
    const previousResult = index > 0 ? results[index - 1] : null;
    this.selectResult(previousResult);
  }

  navigateToResult({ url = '' }) {
    window.location.href = url;
  }

  navigateAllResults() {
    const { enteredQuery } = this.state;
    window.location.href = this.allSearchResultsRelativeUrlForQuery(enteredQuery);
  }

  handleEnter() {
    const { selectedResult } = this.state;
    if (selectedResult) {
      this.navigateToResult(selectedResult);
    } else {
      this.navigateAllResults();
    }
  }

  handleKeyDown(e) {
    if (e.key) {
      if (e.key === 'ArrowDown') {
        this.selectNext();
        e.stopPropagation();
      } else if (e.key === 'ArrowUp') {
        this.selectPrevious();
        e.stopPropagation();
      } else if (e.key === 'Enter') {
        this.handleEnter();
        e.stopPropagation();
      } else if (e.key == 'Escape') {
        this.close();
        e.stopPropagation();
      }
    }
  }

  addHeadersToResults(results) {
    const grouped = _groupBy(results, 'type');
    return [
      ...(grouped.movie ? [
        {
          type: 'header',
          name: 'Movies'
        },
        ...grouped['movie']
      ] : false),
      ...(grouped.tv ? [
        {
          type: 'header',
          name: 'TV Series'
        },
        ...grouped['tv']
      ] : false),
      ...(grouped.actor ? [
        {
          type: 'header',
          name: 'Actors'
        },
        ...grouped['actor']
      ] : false)
    ];
    return withHeader;
  }

  renderNoResultsFound() {
    return (
      <div className="FullscreenSearch__no-results-found-section">
        No results found
      </div>
    );
  }

  renderLoadingResults() {
    return (
      <div className="FullscreenSearch__loading-results">
        Loading...
      </div>
    );
  }

  renderResultHeader(name) {
    return (
      <div
        key={name}
        className="FullscreenSearch__result-header"
      >
        {name}
      </div>
    );
  }

  renderViewAllButton() {
    const {
      results,
      enteredQuery,
    } = this.state;

    if (results.length) {
      return (
        <a
          className="FullscreenSearch__results-view-all"
          href={this.allSearchResultsRelativeUrlForQuery(enteredQuery)}
        >
          View All Results
          <SvgIcon icon="chevron-right"/>
        </a>
      );
    } else {
      return null;
    }
  }

  renderResults() {
    const {
      results,
      selectedResult,
      enteredQuery,
      isFetchingResultsAsync
    } = this.state;

    let content = null;
    if (enteredQuery && results.length === 0 && !isFetchingResultsAsync) {
      content = this.renderNoResultsFound();
    } else if (enteredQuery && isFetchingResultsAsync) {
      content = this.renderLoadingResults();
    } else {
      content = this.addHeadersToResults(results).map(result => {
        const resultClasses = cx('FullscreenSearch__result', {
          'FullscreenSearch__result-two-line-format': !!result.line2,
          'FullscreenSearch__result--selected': result === selectedResult
        });
        if (result.type === 'header') {
          return this.renderResultHeader(result.name);
        }
        return (
          <a
            key={result.url}
            className={resultClasses}
            href={result.url}
            onMouseOver={() => this.selectResult(result)}
          >
            <div
              className="FullscreenSearch__result-thumb"
              style={{backgroundImage: `url(${result.image})`}}>
            </div>
            <div className="FullscreenSearch__result-text-line-1">
              {result.line1}
              {result.yearLine && <span className="FullscreenSearch__result-year">{result.yearLine}</span>}
            </div>
            {result.line2 && <div className="FullscreenSearch__result-text-line-2">{result.line2}</div>}
            <div className="FullscreenSearch__result-bottom-divider"></div>
          </a>
        );
      });
    }

    return (
      <div className="FullscreenSearch__results">
        {content}
      </div>
    );
  }

  handleScroll() {
    if (document.activeElement === this.refs.searchInput) {
      this.refs.fullscreenSearch.focus();
      console.log('touch moved it!');
    }
  }

  render() {
    const {
      enteredQuery,
    } = this.state;

    return (
      <div
        ref="fullscreenSearch"
        tabIndex="-1"
        className="FullscreenSearch"
        onKeyDown={this.handleKeyDown.bind(this)}
        onTouchMove={this.handleScroll.bind(this)}
      >
        <div className="FullscreenSearch__top-section">
          <img className="FullscreenSearch__top-rt-logo" src="//d3biamo577v4eu.cloudfront.net/static/images/logos/rtlogo.png" />
          <button className="FullscreenSearch__close-btn" onClick={this.close.bind(this)}>
            <SvgIcon size={36} icon="close"/>
          </button>
          <div className="FullscreenSearch__top-section-container container">
            <div className="row">
              <div className="col-xs-24 col-sm-20 col-sm-offset-2">
                <div className="FullscreenSearch__search-box">
                  <input
                    ref="searchInput"
                    autoFocus
                    autoCapitalize="off"
                    spellCheck="false"
                    autoCorrect="off"
                    className="FullscreenSearch__input"
                    placeholder="Search movies, TV..."
                    value={this.state.enteredQuery}
                    onChange={this.handleInputChange.bind(this)}
                  />
                  <a
                    href={enteredQuery ? this.allSearchResultsRelativeUrlForQuery(enteredQuery) : null}
                    className="FullscreenSearch__search-btn"
                  >
                    <SvgIcon className="FullscreenSearch__search-icon" size={27} icon="search" style={{height: 36}}/>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="FullscreenSearch__results-container container">
          <div className="row">
            <div className="col-xs-24 col-sm-20 col-sm-offset-2">
              {this.renderResults()}
              {this.renderViewAllButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
