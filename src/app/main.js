/**
 * Entry point for the application.
 */
require('./forwarder/forwarder.js');

const app = require('app');
const BrowserWindow = require('browser-window');

var mainWindow = null;

app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width:800, height:600, 'auto-hide-menu-bar':true});
  mainWindow.loadURL('file://' + __dirname + '/../src/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
