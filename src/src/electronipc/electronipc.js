/**
 * electronipc.js
 * A wrapper for Electron's ipcRenderer.
 */
((ipcRenderer, angular) => {
    'use strict';

    angular
        .module('port-forwarder.ipc', [])
        .factory('electronIpc', () => ipcRenderer);

})(require('electron').ipcRenderer, angular);
