# Server-Sent Events Examples
## What is this?
Server-Sent Events are a way of sending information from a server to its clients using just HTTP. Also, it has no dependencies for clients as all major browsers support it out of the box.

This repo contains some code projects showing example of how to work with it:

* [Node.js + Express Server](./sse-server)
* [jQuery Client](./sse-client/jquery)
* [Vue.js Client](./sse-client/vue)

## How do I run this?
You need to use at least two pieces for the example to work: a server and a client.

### Server
First, you need to run the server, just get into the `sse-server` directory and install its dependencies:

```bash
npm i
```

then, just run the server:

```bash
npm start
```

you should see something like this:

```bash
SSE Example Server listening on 5001
```

that means that the server is running and listening for connections.

### Clients
There are two similar clients that only differ in the front tooling used in each one. You just need to open in your brower the `index.html` located in any of the client directories: `sse-client/vue` or `sse-client/jquery` and you should start seeing message.

## Where do this messages come from?
Every 5 seconds, the server fetches a joke from [ChuckNorris API](https://api.chucknorris.io/) and sends that joke as an SSE message to the clients.

Also, in the terminal you have opened your server, you can type some text and, when hitting `enter`, that text will be sent as a message to the clients.
