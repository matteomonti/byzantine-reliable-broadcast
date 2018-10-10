const peer = require('./peer.js');
const directory = require('./directory.js');

const parameters = {pb: {G: 18}, pbrb: {E: 103, D: 57, Z: 140, T: 80, P: 14, Q: 85}};

if(process.argv[2] === 'pbrbmain')
{
    console.log('Starting directory server at time', Math.floor(Date.now()));
    var N = process.argv[3];
    var server = new directory.server(N);
}
else
{
    (async function()
    {
        var bootTime = Math.floor(Date.now());
        console.log('Starting peer at time', bootTime);

        var mypeer = new peer(process.argv[3], parameters);
        await mypeer.start();
        mypeer.emitter.on('message', function(message)
        {
            var timeStamp = Math.floor(Date.now());
            console.log('Message was pbrb delivered at:', timeStamp);
            // console.log(process.hrtime()[0] + "." + process.hrtime()[1]);
            // console.log('message is dilivered')
            process.exit();
        });

        if(process.argv[2] == 0)
            setTimeout(function()
            {
                var timeStamp = Math.floor(Date.now());
                console.log('Message was sent at:', timeStamp);
                // console.log(process.hrtime()[0] + "." + process.hrtime()[1]);
                mypeer.publish('Hello World!');
            }, 1000);
    })();
}
