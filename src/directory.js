const axon = require('axon');

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

        var pubkeys = [];
        var replies = [];

        // Initialization

        sock.bind(settings.port);

        sock.on('message', function(pubkey, reply)
        {
            pubkeys.push(pubkey);
            replies.push(reply);

            if(pubkeys.length == expected)
            {
                for(var i = 0; i < replies.length; i++)
                    replies[i](pubkeys);
            }
        });
    },
    fetch: function(host, peer)
    {
        return new Promise(function(resolve, reject)
        {
            var sock = axon.socket('req');
            sock.connect(settings.port, host);
            sock.send(peer.pubkey(), function(peers)
            {
                sock.close();
                resolve(peers);
            });
        });
    }
};
