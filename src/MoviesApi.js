import request from 'superagent';
import Promise from 'bluebird';

const hostAndPath = 'https://dsvhf6ya65taf.cloudfront.net/iphone/api/v2/movies';

export function fetchTopBoxOffice() {
  return new Promise((resolve, reject) => {
    request
      .get(hostAndPath)
      .query({cbr: 1})
      .query({filter: 'box-office'})
      .query({cachebuster: 1})
      .end((err, res) => {
        if (res && res.text) {
          const movies = JSON.parse(res.text);
          resolve(movies);
        } else {
          reject('Could not fetch top box office movies');
        }
      });
  });
}

export function fetchOpeningMovies() {
  return new Promise((resolve, reject) => {
    request
      .get(hostAndPath)
      .query({ cbr: 1 })
      .query({ filter: 'opening' })
      .end((err, res) => {
        if (res && res.text) {
          const movies = JSON.parse(res.text);
          resolve(movies);
        } else {
          reject('Could not fetch opening movies');
        }
      });
  });
}

export default {
  fetchTopBoxOffice,
  fetchOpeningMovies
}
