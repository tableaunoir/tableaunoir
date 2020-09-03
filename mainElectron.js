/**
 * Main file to be launched by Electron
 * The command line "electron <nameofthisfile>" will launch this file
 */

const { app, BrowserWindow } = require('electron')


let win = null;

app.on('ready', () => {
    win = new BrowserWindow({
        alwaysOnTop: false,
        width: 1200,
        height: 850,
        fullscreen: true,
        icon: 'img/logo.png',
        title: 'Tableaunoir',
        movable: false
    });


    win.loadFile('index.html')



});
