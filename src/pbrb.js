const axon = require('axon');
const objecthash = require('object-hash');
const distributions = require('probability-distributions')
const eventEmitter = require('events');


var settings =
{
    ports:
    {
        echo: 1235,
        ready: 1236
    }
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

    var messages =
    {
        echo: {received: {}, count: {}},
        ready: {received: {}, count: {}},
        deliver: {received: {}, count: {}}
    };

    // Public members

    self.emitter = new eventEmitter();

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

            (function(host)
            {
                socket.on('message', function(message)
                {
                    handler(host, message);
                });
            })(host);

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
        echo: function(index, message)
        {
            console.log('Received ECHO from', index, ':', message);

            var hash = objecthash(message);
            if(!(messages.echo.received[index]))
            {
                messages.echo.received[index] = message;

                if(!(messages.echo.count[hash]))
                    messages.echo.count[hash] = 1;
                else
                    messages.echo.count[hash]++;

                if(messages.echo.count[hash] >= parameters.T && !checkpoints.ready)
                {
                    console.log('I have received', parameters.T, 'ECHO messages for', message);
                    checkpoints.ready = true;
                    sockets.pub.ready.send(message);
                }
            }
        },
        ready: function(index, message)
        {
            console.log('Received READY from', index, ':', message);

            var hash = objecthash(message);
            if(!(messages.ready.received[index]))
            {
                messages.ready.received[index] = message;

                if(!(messages.ready.count[hash]))
                    messages.ready.count[hash] = 1;
                else
                    messages.ready.count[hash]++;

                if(messages.ready.count[hash] >= parameters.P && !checkpoints.ready)
                {
                    console.log('I have received', parameters.P, 'READY messages for', message);
                    checkpoints.ready = true;
                    sockets.pub.ready.send(message);
                }
            }
        },
        deliver: function(index, message)
        {
            console.log('Received READY from', index, ':', message);

            var hash = objecthash(message);
            if(!(messages.deliver.received[index]))
            {
                messages.deliver.received[index] = message;

                if(!(messages.deliver.count[hash]))
                    messages.deliver.count[hash] = 1;
                else
                    messages.deliver.count[hash]++;

                if(messages.deliver.count[hash] >= parameters.Q && !checkpoints.deliver)
                {
                    console.log('I have received', parameters.Q, 'READY messages for', message);

                    // brb-deliver the message
                    checkpoints.deliver = true;
                    self.emitter.emit('message', message);
                    console.log('message delivered');
                }
            }
        }
    };

    // Setup

    sockets.pub.echo.bind(settings.ports.echo);
    sockets.pub.ready.bind(settings.ports.ready);

    var hosts = Object.keys(peers);

    sockets.sub.echo = subscribe(hosts, parameters.E, settings.ports.echo, handlers.echo);
    sockets.sub.ready = subscribe(hosts, parameters.D, settings.ports.ready, handlers.ready);
    sockets.sub.deliver = subscribe(hosts, parameters.Z, settings.ports.ready, handlers.deliver);

    pb.emitter.on('message', handlers.gossip);
}
