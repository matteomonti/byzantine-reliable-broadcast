const peer = require('./peer.js');
const directory = require('./directory.js');

const N = 17;
const parameters = {pb: {G: 4}};

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
    })();
}
