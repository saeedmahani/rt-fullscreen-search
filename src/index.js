import React from 'react';
import ReactDOM from 'react-dom';
import FullscreenSearch from './FullscreenSearch';
import urllib from 'url';

function openFullscreenSearch(event) {
  let root = document.getElementById('fullscreen-search-root');
  if (!root) {
    console.info('creating root el');
    root = document.createElement('div');
    root.setAttribute('id', 'fullscreen-search-root');
    document.body.appendChild(root);
  } else {
    console.info('reusing root el');
  }
  ReactDOM.render(<FullscreenSearch />, root);
  if (event) {
    event.preventDefault();
  }
}

function attachClickHandler(el, handler) {
  if (el) {
    if (el.addEventListener) { // For all major browsers, except IE 8 and earlier
      el.addEventListener("click", handler);
    } else if (el.attachEvent) { // For IE 8 and earlier versions
      el.attachEvent("onclick", handler);
    }
  }
}

attachClickHandler(document.getElementById('search-term'), openFullscreenSearch);
attachClickHandler(document.getElementById('header_brand_column').children[1].children[0].children[0], openFullscreenSearch);


const currentUrl = urllib.parse(window.location.href, true);
const search = currentUrl.query.search;

if (search) {
  openFullscreenSearch();
}
