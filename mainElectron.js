/**
 * Tableaunoir - desktop version
 * Main file to be launched with electron
 * The command line "electron <nameofthisfile>" will launch this file
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const fs = require('fs');

const DEBUGMODE = false;

//the main window containing Tableaunoir
let win = null;

//the filename of the current board (undefined if no filename were given yet)
let filename = undefined;

ipcMain.on("open", (event, arg) => { openFile(arg) });
ipcMain.on("save", (event, arg) => { fs.writeFileSync(filename, arg) })
ipcMain.on("filename", (event, arg) => { setFilename(arg) })

app.on('ready', () => {
    win = new BrowserWindow({
        alwaysOnTop: false,
        width: 1200,
        height: 850,
        fullscreen: false,
        fullscreenable: true,
        icon: 'img/logo.png',
        title: 'Tableaunoir',
        movable: false,
        webPreferences: {
            nodeIntegration: true, //makes that require('electron') is possible in the web-side,
            contextIsolation: false, // important: otherwise nodeIntegration does not work
        }
    });

    win.loadFile('dist/index.html');
    buildMenu();
    if (DEBUGMODE) win.webContents.openDevTools()

    win.on('close', function (e) {
        const choice = dialog.showMessageBoxSync(this,
            {
                type: 'question',
                buttons: ['Yes', 'No'],
                title: 'Confirm',
                message: 'Are you sure you want to quit?'
            });
        if (choice == 1) {
            e.preventDefault();
        }
    });
});
let isFullScreen = false;



/**
 * @description build the menubar of the desktop application
 */
function buildMenu() {
    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { label: 'New', click() { newDocument() } },
                { label: 'Open', accelerator: "Ctrl+O", click() { openDocument() } },
                { label: 'Save', accelerator: "Ctrl+S", click() { saveDocument() } },
                { label: 'Save As', click() { saveAsDocument() } },
                { label: 'Exit', click() { app.quit() } }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle full screen', accelerator: "F11", click() {
                        isFullScreen = !isFullScreen;
                        win.setFullScreen(isFullScreen);
                    }
                },
                { label: 'Redo', accelerator: "Ctrl+Shift+Z", click() { win.webContents.send("redo"); } },
            ]
        },
        /*,
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: "Ctrl+Z", click() { win.webContents.send("undo"); } },
                { label: 'Redo', accelerator: "Ctrl+Shift+Z", click() { win.webContents.send("redo"); } },
            ]
        },
        {
            label: "Help",
            submenu: [{
                label: 'About...', click() {
                    dialog.showMessageBox(win, { message: "Visit https://zikpad.github.io/" })
                }
            }
            ]
        }*/
    ]);

    Menu.setApplicationMenu(menu);
}

function newDocument() {
    const choice = dialog.showMessageBoxSync(win,
        {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure you want to create a new fresh board?'
        });
    if (choice == 0) { // yes
        filename = undefined;
        win.title = "Tableaunoir - (new board)";
        win.webContents.send("new");
    }

}


function openDocument() {
    const files = dialog.showOpenDialogSync(win, { title: "Open file", filters: [{ name: "Tableaunoir file", extensions: "tableaunoir" }] });
    if (files)
        if (files.length > 0)
            openFile(files[0]);
}


function setFilename(newfilename) {
    win.title = "Tableaunoir - " + newfilename;
    filename = newfilename;
}



function openFile(filenameToOpen) {
    setFilename(filenameToOpen);
    fs.readFile(filenameToOpen, 'utf8', (err, data) => {
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
    const newFilename = dialog.showSaveDialogSync(win, { title: "Save file", filters: [{ name: "Tableaunoir file", extensions: ".tableaunoir" }] });
    if (newFilename == undefined || newFilename == null || newFilename == "") return;
    filename = newFilename;
    win.title = "Tableaunoir - " + filename;
    saveDocument();
}

