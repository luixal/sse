const EventEmitter = require('eventemitter3');
const emitter = new EventEmitter();
const fetch = require('node-fetch');

const HEARTBEAT_TIME = 15000;

function subscribe(req, res) {
  console.log(`[${new Date()}] New client connected from ${req.ip}`);

  res.writeHead(
    200,
    {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  );

  // heartbeat
  const nln = function() {
    res.write('\n');
  }
  const heartbeat = setInterval(nln, HEARTBEAT_TIME);


  const onEvent = function(data) {
    res.write('retry: 3000\n');
    res.write('event: message\n');
    res.write(`id: ${new Date().getTime()}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  emitter.on('event', onEvent);

  req.on(
    'close',
    function() {
      clearInterval(heartbeat);
      emitter.removeListener('event', onEvent);
    }
  );

  // on connectino send open event:
  res.write('event: open\n\n');
  // on connection send example message:
  onEvent({when: new Date(), message: `Hello! I'll keep sending you messages from server`});
  // as this is a DEMO, send a Chuck Norris fact every 5 seconds:
  setInterval(
    () => {
      fetch('https://api.chucknorris.io/jokes/random')
      .then( (res) => res.json() )
      .then( (data) => {onEvent({when: new Date(data.updated_at), message: data.value})} )
      .catch( (error) => onEvent({when: new Date(), message: '[!!!] Error getting data from source!'}) );
    },
    5000
  );
}

function publish(eventData) {
  emitter.emit('event', eventData);
}

module.exports = {
  subscribe,
  publish
};
