const EventSource = require('eventsource');
const eventSource = new EventSource('http://localhost:5001/events');

eventSource.onopen = function() {
  console.log('Connected to server');
}

eventSource.onmessage = function(message) {
  let json = JSON.parse(message.data);
  console.log(`[${new Date(json.when).toLocaleString()}] ${json.message}`);
}

eventSource.onerror = function(error) {
  console.log('Error!!!');
}
