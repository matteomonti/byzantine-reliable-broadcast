const ed = require('ed25519-supercop');

module.exports = function()
{
    // Self

    var self = this;

    // Members

    var keypair = ed.createKeyPair(ed.createSeed());
    var peers;
    
    // Getters

    self.pubkey = function()
    {
        return keypair.publicKey;
    };
};