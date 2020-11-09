class Background {
    static init() {
        document.getElementById("buttonNoBackground").onclick = () => { Background.clear(); Menu.hide(); };
        document.getElementById("buttonMusicScore").onclick = () => { Background.musicScore(); Menu.hide(); };

        document.getElementById("inputBackground").onchange = function (evt) {
            LoadSave.fetchImageFromFile((<any>this).files[0],
                (img) => {
                    Background.clear();
                    const canvasBackground = getCanvasBackground();
                    const height = Layout.getWindowHeight();
                    const scaleWidth = img.width * height / img.height;
                    const x = (Layout.getWindowWidth() - scaleWidth) / 2;
                    console.log(img)
                    canvasBackground.getContext("2d").drawImage(img, x, 0, scaleWidth, height);
                });

        };

    }
    static clear() {
        const canvasBackground = getCanvasBackground();
        canvasBackground.getContext("2d").clearRect(0, 0, canvasBackground.width, canvasBackground.height);
    }


    static musicScore() {
        Background.clear();
        let COLORSTAFF = "rgb(128, 128, 255)";
        let fullHeight = Layout.getWindowHeight() - 32;
        const container = document.getElementById("container");
        const canvasBackground = getCanvasBackground();

        let x = 0;
        let x2 = 2*Layout.getWindowWidth();
        let ymiddleScreen = fullHeight / 2;
        let yshift = fullHeight / 7;
        let drawStaff = (ymiddle) => {
            let space = fullHeight / 30;

            for (let i = -2; i <= 2; i++) {
                let y = ymiddle + i * space;
                drawLine(canvasBackground.getContext("2d"), x, y, x2, y, 1.0, COLORSTAFF);
            }
        }


        drawStaff(ymiddleScreen - yshift);
        drawStaff(ymiddleScreen + yshift);

        BoardManager.saveCurrentScreen();
    }

}