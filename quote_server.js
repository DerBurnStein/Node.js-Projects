#!/usr/bin/env node
/*
 * A simple quote API proxy server.
 *
 * This Node.js application exposes two endpoints:
 *   • GET /quote  - fetches a random inspirational quote from the public
 *                   API at https://api.quotable.io/random and returns a
 *                   JSON payload with the quote content and author.
 *   • GET /health - returns a simple health status JSON.
 *
 * If an error occurs while fetching the quote (for example if the remote
 * API is unreachable), the server responds with an appropriate error
 * message and a 500 status code. The server listens on port 4001 by
 * default but accepts a custom port from the first command‑line argument.
 *
 * Usage:
 *   node quote_server.js [port]
 */

const http = require('http');
const https = require('https');

/**
 * Fetch a random quote from the quotable API.
 *
 * @param {function(Error|null, object=):void} callback - Callback to
 *   invoke with either an error or the quote object containing content
 *   and author fields.
 */
function fetchQuote(callback) {
  const options = {
    hostname: 'api.quotable.io',
    path: '/random',
    method: 'GET',
  };
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json && typeof json === 'object' && json.content && json.author) {
          callback(null, { content: json.content, author: json.author });
        } else {
          callback(new Error('Invalid response format'));
        }
      } catch (e) {
        callback(e);
      }
    });
  });
  req.on('error', (err) => {
    callback(err);
  });
  req.end();
}

const port = parseInt(process.argv[2], 10) || 4001;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  res.setHeader('Content-Type', 'application/json');
  if (pathname === '/quote') {
    fetchQuote((err, quote) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Failed to fetch quote', details: err.message }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify(quote));
    });
  } else if (pathname === '/health') {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Endpoint not found. Use /quote or /health' }));
  }
});

server.listen(port, () => {
  console.log(`Quote server listening on port ${port}`);
});
