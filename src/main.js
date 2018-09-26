const peer = require('./peer.js');
const directory = require('./directory.js');

const N = 17;
const parameters = {pb: {G: 4}, pbrb: {E: 4, D: 4, Z: 4, T: 2, P: 2, Q: 3}};

if(process.env['pbrbmain'])
{
    console.log("Starting directory server");
    var server = new directory.server(N);
}
else
{
    (async function()
    {
        console.log('Starting peer');

        var mypeer = new peer('main', parameters);
        await mypeer.start();
        mypeer.emitter.on('message', function(message)
        {
            console.log('Message PBRB delivered:', message);
        });

        if(process.env['pbrbsender'])
            setTimeout(function()
            {
                mypeer.publish('Hello World!');
            }, 10000);
    })();
}
