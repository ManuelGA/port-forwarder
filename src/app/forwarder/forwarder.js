/**
 * IPC component for the port forwarder.
 */
'use strict';

const sslfwd = require ('./sslforwarder.js');
const tcpfwd = require('./tcpforwarder.js');
const ipcMain = require('electron').ipcMain;

const forwarderChannel = {
    reload: 'FORWARDER_RELOAD',
    delete: 'FORWARDER_DELETE'
};

ipcMain.on(forwarderChannel.reload, (event, list) => {
    if (typeof list === 'object') {
        let updates = [];
        for (let i = 0; i < list.length; ++i) {
            updates.push(updateForwardingRule(list[i]));
        }
        Promise.all(updates).then(
            () => event.sender.send(forwarderChannel.reload, true),
            () => event.sender.send(forwarderChannel.reload, false));
    }
});

ipcMain.on(forwarderChannel.delete, (event, port) => {
    if (typeof port === 'number') {
        deleteForwardingRule(port).then(
            () => event.sender.send(forwarderChannel.delete, true),
            () => event.sender.send(forwarderChannel.delete, false));
    }
});

function createForwardingRule(rule) {

    if(rule.out.port == 443)
    {
        return sslfwd.createForwarder(rule.in.port, rule.out.address, rule.out.port);
    }

    return tcpfwd.createForwarder(rule.in.port, rule.out.address, rule.out.port);    

}

function updateForwardingRule(rule) {
    let resolver = () => createForwardingRule(rule);
    return deleteForwardingRule(rule.in.port).then(resolver, resolver);
}

function deleteForwardingRule(port)
{    
    if(typeof (tcpfwd.get(port)) === 'undefined')
    {
        return sslfwd.unset(port);
    }

    return tcpfwd.unset(port);
}
