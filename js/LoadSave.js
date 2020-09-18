class LoadSave {
    static init() {
        document.getElementById("save").onclick = LoadSave.save;
        //document.getElementById("load").onchange = LoadSave.load;
        document.body.ondragover = (event) => {
            console.log('File(s) in drop zone');

            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();
        }
        document.body.ondrop = (event) => {
            console.log("drop!", event);
            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();

            if (event.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (var i = 0; i < event.dataTransfer.items.length; i++) {
                    // If dropped items aren't files, reject them
                    if (event.dataTransfer.items[i].kind === 'file') {
                        var file = event.dataTransfer.items[i].getAsFile();
                        LoadSave.loadFile(file);
                    }
                }
            } else {
                // Use DataTransfer interface to access the file(s)
                for (var i = 0; i < event.dataTransfer.files.length; i++) {
                    LoadSave.loadFile(file[i]);
                }
            }

        };
    }


    static loadFile(file) {
        if (file) {
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                LoadSave.loadJSON(JSON.parse(evt.target.result));
                //document.getElementById("fileContents").innerHTML = evt.target.result;
            }
            reader.onerror = function (evt) {
                //document.getElementById("fileContents").innerHTML = "error reading file";
            }
        }
        // fetch FileList object
        //  var files = e.target.files || e.dataTransfer.files;

        // process all File objects
        /*   for (var i = 0, f; f = files[i]; i++) {
               f.data
           }*/

    }
    static loadJSON(obj) {
        BoardManager.load(obj.canvasDataURL);
        document.getElementById("magnets").innerHTML = obj.magnets;
        MagnetManager.installMagnets();
    }

    static save() {
        let magnets = document.getElementById("magnets").innerHTML;
        let canvasDataURL = document.getElementById("canvas").toDataURL();
        let obj = { magnets: magnets, canvasDataURL: canvasDataURL };
        LoadSave.download("myblackboard.tableaunoir", JSON.stringify(obj));
    }


    static download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

}

