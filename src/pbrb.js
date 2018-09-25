const axon = require('axon');

var settings =
{
    echoPort: 1235;
    readyPort: 1236;
};

module.exports = function(peers, parameters)
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

    // Private methods

    var subscribe = function(hosts, size, port, handler)
    {
        var sub = [];

        for(var i = 0; i < size; i++)
        {
            var randomIndex = Math.floor(Math.random() * (size + 1));
            var socket = new axon.socket('sub');

            socket.connect(port, hosts[randomIndex]);
            socket.on('message', function(message)
            {
                handler(hosts[randomIndex], message);
            });

            sub.push(socket);
        }

        return sub;
    }

    var handlers =
    {
        gossip: function(message)
        {

        },
        echo: function(host, message)
        {
            
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
    sockets.sub.deliver = subscribe(hosts, parameters.Z, setting.readyPort, handlers.deliver);
}
