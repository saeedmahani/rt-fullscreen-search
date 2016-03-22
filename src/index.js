import React from 'react';
import ReactDOM from 'react-dom';
import FullscreenSearch from './FullscreenSearch';

function openFullscreenSearch() {
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
}

const searchFieldEl = document.getElementById('search-term');
if (searchFieldEl) {
  if (searchFieldEl.addEventListener) { // For all major browsers, except IE 8 and earlier
    searchFieldEl.addEventListener("click", openFullscreenSearch);
  } else if (searchFieldEl.attachEvent) { // For IE 8 and earlier versions
    searchFieldEl.attachEvent("onclick", openFullscreenSearch);
  }
} else {
  alert('Could not find and attach to the search field');
}

