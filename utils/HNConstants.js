const navLinks = [
      { text: 'new', href: 'newest', expectedUrl: /newest$/ },
      { text: 'past', href: 'front', expectedUrl: /front$/ },
      { text: 'comments', href: 'newcomments', expectedUrl: /newcomments$/ },
      { text: 'ask', href: 'ask', expectedUrl: /ask$/ },
      { text: 'show', href: 'show', expectedUrl: /show$/ },
      { text: 'jobs', href: 'jobs', expectedUrl: /jobs$/ }
    ];

const URLS = {
  HOME: 'https://news.ycombinator.com/',
  NEWS: 'https://news.ycombinator.com/news',
  NEW: 'https://news.ycombinator.com/newest',
  PAST: 'https://news.ycombinator.com/front',
  COMMENTS: 'https://news.ycombinator.com/newcomments',
  ASK: 'https://news.ycombinator.com/ask',
  SHOW: 'https://news.ycombinator.com/show',
  JOBS: 'https://news.ycombinator.com/jobs',
  LOGIN: 'https://news.ycombinator.com/login',
  SUBMIT: 'https://news.ycombinator.com/submit'

}

module.exports = {
  navLinks,
  URLS
};