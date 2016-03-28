import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Bloodhound from 'bloodhound-js';
import cx from 'classnames';
const _groupBy = require('lodash/groupBy');
const _isFunction = require('lodash/isFunction');
const _defer = require('lodash/defer');
import SvgIcon from './SvgIcon.js';
import { fetchTopBoxOffice, fetchOpeningMovies } from './MoviesApi';
import Promise from 'bluebird';
import urllib from 'url';

require('./FullscreenSearch.less');

const resultsPerCategory = 5;

export default class FullscreenSearch extends Component {
  constructor(props) {
    super(props);

    const currentUrl = urllib.parse(window.location.href, true);
    const search = decodeURIComponent(currentUrl.query.search);

    if (search) {
      this.state.enteredQuery = search;
    }

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

  componentDidMount() {
    document.body.className = document.body.className + ' FullscreenSearch__modal--open';

    if (this.state.enteredQuery) {
      this.fetchAndUpdateResults(this.state.enteredQuery);
      _isFunction(this.refs.searchInput.select) && this.refs.searchInput.select();
    } else {
      Promise.join(fetchOpeningMovies(), fetchTopBoxOffice(),
        (openingMovies, topBoxOfficeMovies) => {
          this.updateResults(this.transformIphoneMoviesApiResponseToResults([
            ...openingMovies.slice(0, 3),
            ...topBoxOfficeMovies.slice(0, 10)
          ]));
        });
    }
  }

  componentWillUnmount() {
    document.body.className = document.body.className.replace(/FullscreenSearch__modal--open/g, '');
  }

  movieRelativeUrlForVanity(vanity) {
    return `/m/${vanity}`;
  }

  actorRelativeUrlForVanity(vanity) {
    return `/celebrity/${vanity}`;
  }

  allSearchResultsRelativeUrlForQuery(query) {
    return `/search/?search=${query}`;
  }

  transformIphoneMoviesApiResponseToResults(response) {
    return response.map(m => ({
      type: 'topMovie',
      url: this.movieRelativeUrlForVanity(m.id),
      image: m.poster && m.poster.profile ? m.poster.profile : null,
      line1: m.title,
      line2: m.actors.slice(0, 2).map(a => a.name).join(', '),
      yearLine: m.theaterReleaseDate ? `(${m.theaterReleaseDate.year})` : null
    }))
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
    this.clearQueryFromUrl();
    const root = document.getElementById('fullscreen-search-root');
    ReactDOM.unmountComponentAtNode(root);
    document.body.removeChild(root);
  }

  fetchAndUpdateResults(query) {
    this.setState({
      enteredQuery: query,
      isFetchingResultsAsync: true
    });
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

  handleInputChange(event) {
    this.fetchAndUpdateResults(event.target.value);
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

  saveQueryToUrl(query) {
    if (query && window.history && window.history.replaceState) {
      const currentUrl = urllib.parse(window.location.href, true);
      currentUrl.query.search = query;
      currentUrl.search = null;
      window.history.replaceState(null, null, urllib.format(currentUrl));
    }
  }

  clearQueryFromUrl() {
    if (window.history && window.history.replaceState) {
      const currentUrl = urllib.parse(window.location.href, true);
      delete currentUrl.query.search;
      currentUrl.search = null;
      window.history.replaceState(null, null, urllib.format(currentUrl));
    }
  }

  navigateToResult({ url = '' }, event) {
    event.preventDefault();
    const { enteredQuery } = this.state;
    if (enteredQuery) {
      this.saveQueryToUrl(enteredQuery);
    }
    setTimeout(() => { window.location.href = url }, 50);
  }

  navigateToAllResults() {
    const { enteredQuery } = this.state;
    window.location.href = this.allSearchResultsRelativeUrlForQuery(enteredQuery);
  }

  handleEnter() {
    const { selectedResult } = this.state;
    if (selectedResult) {
      this.navigateToResult(selectedResult);
    } else {
      this.navigateToAllResults();
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
      ] : false),
      ...(grouped.topMovie ? [
        {
          type: 'header',
          name: 'Top Movies Now'
        },
        ...grouped['topMovie']
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

    if (enteredQuery && results.length) {
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
          'FullscreenSearch__result-one-line-format': !result.line2,
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
            onClick={(e) => this.navigateToResult(result, e)}
            onMouseOver={() => this.selectResult(result)}
          >
            <div className="FullscreenSearch__result-left-cell">
              <div
                className="FullscreenSearch__result-thumb"
                style={{backgroundImage: `url(${result.image})`}}>
              </div>
            </div>
            <div className="FullscreenSearch__result-right-cell">
              <div className="FullscreenSearch__result-text-line-1">
                {result.line1}
                {result.yearLine && <span className="FullscreenSearch__result-year">{result.yearLine}</span>}
              </div>
              {result.line2 && <div className="FullscreenSearch__result-text-line-2">{result.line2}</div>}

            </div>
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
    // onTouchMove={this.handleScroll.bind(this)}
    if (document.activeElement === this.refs.searchInput) {
      this.refs.searchInput.blur();
      //this.refs.fullscreenSearch.focus();
    }
  }

  handleClearQuery() {
    this.clearQueryFromUrl();
    this.fetchAndUpdateResults('');
    this.refs.searchInput.focus();
  }

  render() {
    const {
      enteredQuery,
    } = this.state;

    return (
      <div
        ref="fullscreenSearch"
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
                    autoCapitalize="off"
                    spellCheck="false"
                    autoCorrect="off"
                    autoFocus
                    className="FullscreenSearch__input"
                    placeholder="Search movies, TV..."
                    value={this.state.enteredQuery}
                    onChange={this.handleInputChange.bind(this)}
                  />
                  {enteredQuery && <a
                    className="FullscreenSearch__clear-search-query-btn"
                    onClick={this.handleClearQuery.bind(this)}
                  >
                    <SvgIcon className="FullscreenSearch__clear-search-query-icon" size={27} icon="cancel" style={{height: 36}}/>
                  </a>}
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
