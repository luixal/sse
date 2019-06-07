# SSE Node.js Server
Although it is quite simple, I will comment the most important pieces here, so I don't forget either :)

## Deps
The only **realy** needed dependencies are `express`, `eventemitter3` and maybe `cors`.

We are using `readline` just for taking input from _stdin_ to send testing messages. And `node-fetch` as quick way to get jokes from [Chuck's API](https://api.chucknorris.io/).

## Express
Quite well-known framework used mainly to develop HTTP APIs or even full apps. As Server-Sent Events _run_ over HTTP is great for our case.

As you can notice by having a look at [server.js](./src/server.js), we only have defined one `GET` route:

```javascript
app.get('/events', cors(), events.subscribe);
```

This is needed as our clients need to connect to a HTTP URL, but can be also handy to handle parameters. As **messaging goes only in one direction (server --> clients)**, if one client only needs a subset of the full info, it should query different URLs or one URL with some filtering params. Having played with that yet, but seems the way to go if you need to get something _content based_-ish.

### Subscription
When a client queries the `/events` endpoint, the `subscribe` function gets fired and takes over the connection with that client, keeping it open and sending events over it. You can have a look at the hole function in the [events.js](./src/events.js) file, but let's go through it a little bit:

First thing done is sending to the client the `text/event-stream` header so it knows what's going on. Notice that the query is never _sent_ the usual express way because that will end the connection. We then send a newline and set an interval for sending a newline from time to time as a heartbeat:

```javascript
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
```

Here, we define the function that will be used to send info in the SSE format. We also set an event to fire this function so we cand send messages from anywhere in this Node.js app. Won't be necessary using other approach:

```javascript
  const onEvent = function(data) {
    res.write('retry: 3000\n');
    res.write('event: message\n');
    res.write(`id: ${new Date().getTime()}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  emitter.on('event', onEvent);
```

If a client closes its connection, we just clear the interval for the heartbeat and remove the listener. Why? Because **we are setting an interval and a listener for each client connection**:

```javascript
  req.on(
    'close',
    function() {
      clearInterval(heartbeat);
      emitter.removeListener('event', onEvent);
    }
  );
```

We send the `open` event so the client can registered that the connection has been stablished. We also send a welcome message:

```javascript
  // on connectino send open event:
  res.write('event: open\n\n');
  // on connection send example message:
  onEvent({when: new Date(), message: `Hello! I'll keep sending you messages from server`});
```

This is less interesting for the SEE purpouse, we just set an interval to query [Chuck's API](https://api.chucknorris.io/) every 5secs, parse the response and send the joke or the error we get:

```javascript
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
```

If you're wondering about all the `\n`, `open`, `event:`, etc... just have a look at the SSE format, it's quite simple.
