const axon = require('axon');
const objecthash = require('object-hash');
const distributions = require('probability-distributions')
const shuffle = require('shuffle-array');
const eventEmitter = require('events');

var settings =
{
    port: 1234
};

module.exports = function(peers, parameters)
{
    // Self

    var self = this;

    // Members

    var sockets = {pub: new axon.socket('pub'), sub: []};
    var messages = new Set();
    var subscriptions = new Set();

    // Public members

    self.emitter = new eventEmitter();

    // Private methods

    var handle = function(message)
    {
        var hash = objecthash(message);
        if(!(messages.has(hash)))
        {
            messages.add(hash);
            sockets.pub.send(message);
            self.emitter.emit('message', message);
            console.log('Message was pb delivered at:', Math.floor(Date.now()));
        }
    };

    var subscribe = function(host)
    {
        if(!(subscriptions.has(host)))
        {
            subscriptions.add(host);

            var socket = new axon.socket('sub');
            socket.connect(settings.port, host);

            socket.on('message', handle);

            sockets.sub.push(socket);
        }
    };

    // Methods

    self.send = handle;

    // Setup


    sockets.pub.bind(settings.port);

    sockets.pub.on('connect', function(peer) // Reciprocate the connection
    {
        subscribe(peer._peername.address);
    });

    var G = distributions.rpois(1, parameters.G)[0];
    var hosts = shuffle(Object.keys(peers));

    for(var i = 0; i < G; i++)
        subscribe(hosts[i]);
};
