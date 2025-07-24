#!/usr/bin/env node
/*
 * A simple calculator HTTP server.
 *
 * This Node.js application exposes four endpoints for basic arithmetic
 * operations: addition, subtraction, multiplication and division. Each
 * endpoint accepts two numeric query parameters, `a` and `b`, performs
 * the corresponding operation and returns the result as a JSON object.
 *
 * Usage:
 *   node calculator_server.js [port]
 *
 * If no port is supplied, the server listens on 4000 by default. To test
 * the server, run it and navigate to URLs such as:
 *   http://localhost:4000/add?a=2&b=3
 *   http://localhost:4000/subtract?a=5&b=1
 *
 * The server also responds to unknown paths with a 404 status and a
 * descriptive error message.
 */

const http = require('http');

/**
 * Parse a numeric query parameter from a URLSearchParams object.
 *
 * @param {URLSearchParams} params - The search parameters.
 * @param {string} name - The name of the parameter to retrieve.
 * @returns {number|undefined} The numeric value or undefined if missing or NaN.
 */
function parseNumber(params, name) {
  const value = params.get(name);
  if (value === null) return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Perform the requested arithmetic operation.
 *
 * @param {string} op - Operation name: add, subtract, multiply or divide.
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} The result of the operation.
 */
function calculate(op, a, b) {
  switch (op) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) {
        throw new Error('Division by zero');
      }
      return a / b;
    default:
      throw new Error(`Unknown operation: ${op}`);
  }
}

const port = parseInt(process.argv[2], 10) || 4000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/^\//, '');
  const operation = pathname.toLowerCase();

  // Set default response headers
  res.setHeader('Content-Type', 'application/json');

  // Only handle supported operations
  const supportedOps = ['add', 'subtract', 'multiply', 'divide'];
  if (supportedOps.includes(operation)) {
    const a = parseNumber(url.searchParams, 'a');
    const b = parseNumber(url.searchParams, 'b');
    if (a === undefined || b === undefined) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({ error: 'Missing or invalid query parameters a and b' })
      );
      return;
    }
    try {
      const result = calculate(operation, a, b);
      res.statusCode = 200;
      res.end(JSON.stringify({ operation, a, b, result }));
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    // Handle unknown routes
    res.statusCode = 404;
    res.end(
      JSON.stringify({ error: 'Endpoint not found. Use /add, /subtract, /multiply or /divide' })
    );
  }
});

server.listen(port, () => {
  console.log(`Calculator server listening on port ${port}`);
});
