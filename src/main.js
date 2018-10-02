const peer = require('./peer.js');
const directory = require('./directory.js');

const parameters = {pb: {G: 4}, pbrb: {E: 4, D: 4, Z: 4, T: 2, P: 2, Q: 3}};

if(process.argv[2] === 'pbrbmain')
{
    // console.log('Starting directory server');
    var N = process.argv[3];
    var server = new directory.server(N);
}
else
{
    (async function()
    {
        // console.log('Starting peer');

        var mypeer = new peer('main', parameters);
        await mypeer.start();
        mypeer.emitter.on('message', function(message)
        {
            console.log(process.hrtime()[0] + "." + process.hrtime()[1]);
            // console.log('message is dilivered')
        });

        if(process.argv[2] === 0)
            setTimeout(function()
            {
                // console.log(process.hrtime()[0] + "." + process.hrtime()[1]);
                mypeer.publish('Hello World!');
            }, 1000);
    })();
}
