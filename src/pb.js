const axon = require('axon');
const objecthash = require('object-hash');
const distributions = require('probability-distributions')
const shuffle = require('shuffle-array');

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

    // Private methods

    var subscribe = function(host)
    {
        if(!(subscriptions.has(host)))
        {
            subscriptions.add(host);
            console.log('Subscribing to', host);

            var socket = new axon.socket('sub');
            socket.connect(settings.port, host);

            socket.on('message', function(message)
            {
                var hash = objecthash(message);
                if(!(messages.has(hash)))
                {
                    messages.add(hash);
                    sockets.pub.send(message);
                    // TODO: Emit event here
                }
            });

            sockets.sub.push(socket);
        }
    };

    // Setup

    sockets.pub.bind(settings.port);

    sockets.pub.on('connect', function(peer) // Reciprocate the connection
    {
        console.log('Received subscription from', peer._peername.address, '(subscribing back)');
        subscribe(peer._peername.address);
    });

    var G = distributions.rpois(1, parameters.G)[0];
    var hosts = shuffle(Object.keys(peers));

    for(var i = 0; i < G; i++)
        subscribe(hosts[i]);
};
