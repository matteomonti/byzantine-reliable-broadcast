const ed = require('ed25519-supercop');
const axon = require('axon');
const ip = require('ip');

const directory = require('./directory.js');
const pb = require('./pb.js');

module.exports = function(host, parameters)
{
    // Self

    var self = this;

    // Members

    var keypair = ed.createKeyPair(ed.createSeed());
    var peers = {};

    var daemons = {};

    // Getters

    self.pubkey = function()
    {
        return keypair.publicKey;
    };

    // Methods

    self.start = async function()
    {
        var peerlist = await directory.fetch(host, self);
        console.log('Peer list retrieved');

        for(var i = 0; i < peerlist.length; i++)
            peers[peerlist[i].ip] = peerlist[i].pubkey;

        daemons.pb = new pb(peers, parameters.pb);
    };
};
