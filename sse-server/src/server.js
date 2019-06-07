const express = require('express');
const cors = require('cors');
const app = express();

const events = require('./events');
const PORT = 5001;

app.get('/events', cors(), events.subscribe);

const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

app.listen(
  PORT,
  () => {
    console.log(`SSE Example Server listening on ${PORT}`);
    readline.on(
      'line',
      (line) => { events.publish({ when: new Date(), message: line}); }
    );
  }
);
