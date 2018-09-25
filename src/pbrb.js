const axon = require('axon');
const distributions = require('probability-distributions')

var settings =
{
    echoPort: 1235,
    readyPort: 1236
};

module.exports = function(peers, pb, parameters)
{
    // Self

    var self = this;


    // Members

    var sockets =
    {
        pub:
        {
            echo: new axon.socket('pub'),
            ready: new axon.socket('pub')
        },
        sub:
        {
            echo: [],
            ready: [],
            deliver: []
        }
    };

    var checkpoints =
    {
        echo: false,
        ready: false,
        deliver: false
    };

    // Private methods

    var subscribe = function(hosts, size, port, handler)
    {
        var sub = [];

        var randomIndexes = distributions.rint(size, 0, hosts.length - 1);

        for(var i = 0; i < size; i++)
        {
            var host = hosts[randomIndexes[i]];
            var socket = new axon.socket('sub');

            console.log('Subscribing to', host, ":", port);

            socket.connect(port, host);
            socket.on('message', function(message)
            {
                handler(host, message);
            });

            sub.push(socket);
        }

        return sub;
    }

    var handlers =
    {
        gossip: function(message)
        {
            console.log('Received message from the gossip:', message);

            if(!checkpoints.echo)
            {
                checkpoints.echo = true;
                sockets.pub.echo.send(message);
            }
        },
        echo: function(host, message)
        {
            console.log('Received ECHO from', host, ':', message);
        },
        ready: function(host, message)
        {

        },
        deliver: function(host, message)
        {

        }
    };

    // Setup

    sockets.pub.echo.bind(settings.echoPort);
    sockets.pub.ready.bind(settings.readyPub);

    var hosts = Object.keys(peers);

    sockets.sub.echo = subscribe(hosts, parameters.E, settings.echoPort, handlers.echo);
    sockets.sub.ready = subscribe(hosts, parameters.D, settings.readyPort, handlers.ready);
    sockets.sub.deliver = subscribe(hosts, parameters.Z, settings.readyPort, handlers.deliver);

    pb.emitter.on('message', handlers.gossip);
}
