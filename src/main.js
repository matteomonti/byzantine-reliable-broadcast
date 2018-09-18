const peer = require('./peer.js');
const directory = require('./directory.js');

const N = 10;

var server = new directory.server(N);

var peers = [];

for(var i = 0; i < N; i++)
    peers.push(new peer());
