/**
 * Main file to be launched by Electron
 * The command line "electron ." will launch this file
 */

const { app, BrowserWindow } = require('electron')
const fs = require('fs');


let win = null;
let filename = undefined;

function newDocument() {
    filename = undefined;
    win.title = "Zikpad - (new document)";
    win.webContents.send("new");
}

function openDocument() {
    let files = dialog.showOpenDialogSync({ title: "Open file", filters: [{ name: "Lilypond file", extensions: "ly" }] });
    openFile(files[0]);

}

function openFile(filename) {
    win.title = "Zikpad - " + filename;
    fs.readFile(filename, 'utf8', (err, data) => {
        win.webContents.send("open", data)
    });
}

function saveDocument() {
    if (filename == undefined)
        saveAsDocument();
    else
        win.webContents.send("save");
}

function saveAsDocument() {
    let newFilename = dialog.showSaveDialogSync({ title: "Save file", filters: [{ name: "Lilypond file", extensions: "ly" }] });
    if (newFilename == undefined) return;

    filename = newFilename;
    win.title = "Zikpad - " + filename;
    saveDocument();
}

app.on('ready', () => {
    win = new BrowserWindow({
        alwaysOnTop: false,
        width: 1200,
        height: 850,
        fullscreen: true,
        //   icon: 'assets/zds.png',
        title: 'Tableaunoir',
        webPreferences: { nodeIntegration: true },
        movable: false
    });


    win.loadFile('index.html')



});
