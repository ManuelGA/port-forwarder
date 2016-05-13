/**
 * TCP Port Forwarder.
 */
'use strict';

module.exports = {
    createForwarder: createForwarder,
    unset:           deleteForwarder,
    get:             getFowarder,
    getArray:        getAllFowarders
};

const tls = require('tls');
const fs = require('fs');
const dns = require('dns');

let forwarders = {};

const optionsServer = {

    pfx: fs.readFileSync('./app/forwarder/servers.pfx'),

};

const optionsClient = {

    pfx: fs.readFileSync('./app/forwarder/client.pfx'),

    checkServerIdentity: function (host, cert)
    {
        return undefined;
    }
};

function createForwarder(fromPort, toHost, toPort) {

    return new Promise((resolve, reject) => {
        try {

            dns.resolve4(toHost, function(err, addresses)
            {
                if(err) return err;
                toHost = addresses[0];
                console.log(toHost);
            });

            forwarders[fromPort] = {
                address:  toHost,
                port:     toPort,
                listener: createConnection(toHost, toPort).listen(fromPort)
            };

            resolve(forwarders[fromPort]);

        } catch (e) {
            reject(e);
        }
    });
}

function createConnection(toHost, toPort) {

    return tls.createServer(optionsServer, (client) => {

        console.log(toHost);
        
        let remote = tls.connect(toPort, toHost, optionsClient, function()
        {
            console.log(remote.authorized ? 'Authorized' : 'Not Authorized');

            client.on('error', (err) => {
                if(err.errno == 'ECONNRESET')
                {   
                remote.destroy();
                } 
                console.log("Error: " + err);
            });

            remote.on('error', (err) => {
                if(err.errno == 'ECONNRESET')
                {
                    client.destroy();
                } 
                console.log("Error: " + err);
            });

                client.pipe(remote);
                remote.pipe(client);
        });  
    });
}

function deleteForwarder(fromPort) {

    return new Promise((resolve, reject) => {
        if (forwarders[fromPort]) {
            forwarders[fromPort].listener
                .close(() => resolve(delete forwarders[fromPort]));
        } else {
            reject();
        }
    });
}

function getFowarder(fromPort) {

    let forwarder;
    
    if(typeof(forwarder = forwarders[fromPort]) === 'undefined')
    {
        return forwarder;
    }

    return {
        fromPort: fromPort,
        toHost:   forwarder.address,
        toPort:   forwarder.port,
        listener: forwarder.listener
    };
}

function getAllFowarders() {

    let a = [];
    for (let i in forwarders) {
        a.push(getFowarder(i));
    }
    return a;
}