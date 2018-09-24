const peer = require('./peer.js');
const directory = require('./directory.js');

const N = 10;

console.log("Starting server")
var server = new directory.server(N);

console.log("Creating peers")
var peers = [];

for(var i = 0; i < N; i++)
    peers.push(new peer());