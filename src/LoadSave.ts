/**
 * this class contains the code for loading/saving a tableaunoir. Also for importing images as magnets.
 */
class LoadSave {

    /**
     * @description initialize the button Save and the drag and drop of files
     */
    static init() {
        /**
         * load a file from the <input type="file"...>
         */
        document.getElementById("file").onchange = function (evt) {
            LoadSave.loadFile((<any>this).files[0]);
        };



        document.getElementById("save").onclick = LoadSave.save;
        document.getElementById("exportPng").onclick = LoadSave.exportPng;




        document.body.ondragover = (event) => {
            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();
        }
        document.body.ondrop = (event) => {
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

    /**
     * 
     * @param {File} file 
     * @description load the file file
     */
    static loadFile(file) {
        if (file) {
            let reader = new FileReader();
            reader.onerror = function (evt) { }

            /** load a .tableaunoir file, that is, a file containing the blackboard + some magnets */
            if (file.name.endsWith(".tableaunoir")) {
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) { LoadSave.loadJSON(JSON.parse(<any>evt.target.result)); }
            }
            else {
                /** load an image and add it as a magnet */
                reader.readAsDataURL(file);
                reader.onload = function (evt) {
                    let img = new Image();
                    img.src = <string>evt.target.result;
                    MagnetManager.addMagnet(img);
                }
            }
        }
    }



    /**
     * 
     * @param file 
     * @param callback 
     * @descrption load the image in the file, once the file is loaded. Call the callback function.
     */
    static fetchImageFromFile(file, callback) {
        let reader = new FileReader();
        reader.onerror = function (evt) { }
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            let img = new Image();
            img.src = <string>evt.target.result;
            img.onload = () => callback(img);
        }
    }


    /**
     * 
     * @param {*} obj 
     * @description load the JSON object:
     * obj.canvasDataURL is the content of the canvas
     * obj.magnets is the HTML code of the magnets
     */
    static loadJSON(obj) {
        BoardManager.load(obj.canvasDataURL);
        document.getElementById("magnets").innerHTML = obj.magnets;
        MagnetManager.installMagnets();
    }


    /**
     * @description export the board as a .png image file
     */
    static exportPng() {
        const node = document.getElementById("content");
        alert("to be implemented. Do screenshots.");
        /*html2canvas(node).then(canvas => {
            LoadSave.downloadDataURL(document.getElementById("exportPngName").value + ".png", canvas.toDataURL());
        });*/


    }


    /**
     * @description save the blackboard and the magnets
     */
    static save() {
        let magnets = document.getElementById("magnets").innerHTML;
        let canvasDataURL = getCanvas().toDataURL();
        let obj = { magnets: magnets, canvasDataURL: canvasDataURL };
        LoadSave.download((<HTMLInputElement>document.getElementById("name")).value + ".tableaunoir", JSON.stringify(obj));
    }

    /**
     * 
     * @param {*} filename 
     * @param {*} text 
     * @description propose to download a file called filename that contains the text text
     */
    static download(filename, text) {
        LoadSave.downloadDataURL(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))

    }



    /**
 * 
 * @param {*} filename 
 * @param {*} dataURL 
 * @description propose to download a file with the content
 */
    static downloadDataURL(filename, dataURL) {
        let element = document.createElement('a');
        element.setAttribute('href', dataURL);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

}

