const axon = require('axon');
const ip = require('ip');

var settings =
{
    port: 1234
};

module.exports =
{
    settings: settings,
    server: function(expected)
    {
        // Self

        var self = this;

        // Members

        var sock = axon.socket('rep');

        var peers = [];
        var replies = [];

        // Initialization

        sock.bind(settings.port);

        sock.on('message', function(peer, reply)
        {
            peers.push(peer);
            replies.push(reply);

            if(peers.length == expected)
            {
                for(var i = 0; i < replies.length; i++)
                    replies[i](peers);
            }
        });
    },
    fetch: function(host, peer)
    {
        return new Promise(function(resolve, reject)
        {
            var sock = axon.socket('req');
            sock.connect(settings.port, host);
            sock.send({ip: ip.address(), pubkey: peer.pubkey()}, function(peers)
            {
                sock.close();
                resolve(peers);
            });
        });
    }
};
