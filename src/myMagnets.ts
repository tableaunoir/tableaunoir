import { MagnetManager } from './magnetManager';
import { MagnetPositionner } from './MagnetPositionner';



let emojis = undefined;
/**
@returns a promise on an array containing all the emojis
**/
async function fetchAllEmojis() {
    const r = await fetch(`https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/data/openmoji.json`);
    if (r.ok) {
        emojis = (await r.json()).filter(emoji => emoji.hexcode.length <= 5);
        return emojis;
    }
    else
        throw "Impossible to connect to OpenMoji";

}




/**
 * 
 * @param hexcode 
 * @returns the magnet corresponing to the image of hexcode
 */
function openMojiMagnet(hexcode: string): HTMLImageElement {
    /**
    * @param hexcode 
    * @returns the url to the SVG filename
    */
    const openMojiSVGurl = (hexcode: string) => `https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/${hexcode}.svg`;

    const el = document.createElement("img");
    fetch(openMojiSVGurl(hexcode)).then((response) => response.text().then(
        (txt) => {
            const svgStr = encodeURIComponent(txt.replace("<svg ", '<svg width="72" height="72" '));
            // const blob = new Blob([svgStr], { type: 'image/svg+xml' });//blob can not be saved :(
            el.src = 'data:image/svg+xml;utf8,' + svgStr;//URL.createObjectURL(blob);
        }));
    el.style.width = "96px";
    return el;
}


/**
 * 
 * @param groupName 
 * @returns a generator of some magnets for a given group name 
 */
function collectionOpenMojiSlice(groupName: string): () => Generator<HTMLElement> {
    return function* () {
        for (const emoji of emojis.filter((emoji => emoji.group == groupName)).slice(0, 32)) {
            yield openMojiMagnet(emoji.hexcode)
        }
    }

}


/**
 * 
 * @param hexcodes 
 * @returns a generator of magnets for the hexcodes
 */
function explicitCollectionOpenMoji(hexcodes: string[]): () => Generator<HTMLElement> {
    return function* () {
        for (const hexcode of hexcodes) {
            yield openMojiMagnet(hexcode)
        }
    }

}

/**
 * this class contains the predefined magnets
 */
export class MyMagnets {

    /**
     * 
     * @param caption 
     * @returns a magnet whose text is caption
     */
    static createMagnet(caption: string): HTMLElement {
        const o = document.createElement("div");
        o.style.backgroundColor = "#EEEEEE";
        o.innerHTML = caption;
        return o;
    }

    /**
     *
     * @param filename
     * @param callback
     * @description create an image magnet where the file is already on the server
     */
    static createMagnetImage(filename: string): HTMLElement {
        const img = new Image();
        img.src = "img/magnets/" + filename;
        img.classList.add("backgroundTransparent");
        return img;
    }


    /** Gale-Shapley */
    static * magnetGS(): Generator<HTMLElement> {
        const createMagnetGS_B: (content: string) => HTMLElement = (content) => {
            const o = document.createElement("div");
            o.innerHTML = content;
            o.classList.add("GS_B")
            return o;
        }

        yield MyMagnets.createMagnet("1");
        yield MyMagnets.createMagnet("2");
        yield MyMagnets.createMagnet("3");
        yield createMagnetGS_B("1");
        yield createMagnetGS_B("2");
        yield createMagnetGS_B("3");
    }

    /**
     * 
     * @param n
     * @returns create a magnet displaying the number n and the background is according the rainbow
     */
    static createMagnetRainbow(n: number): HTMLElement {
        const o = MyMagnets.createMagnet("" + n);
        const colors = ['rgb(139, 97, 195)', 'rgb(115, 97, 195)', 'rgb(93, 105, 214)', 'rgb(40, 167, 226)', 'rgb(40, 204, 226)', 'rgb(40, 226, 201)', 'rgb(40, 226, 148)',
            'rgb(40, 226, 102)', 'rgb(130, 226, 40)', 'rgb(170, 226, 40)', 'rgb(223, 226, 40)', 'rgb(226, 183, 40)',
            'rgb(226, 152, 40)', 'rgb(226, 124, 40)', 'rgb(226, 77, 40)', 'rgb(255, 0, 0)', 'rgb(144, 24, 24)'];
        o.style.backgroundColor = colors[n - 1];
        return o;
    }

    /** Sorting */
    static * magnetSorting(): Generator<HTMLElement> {
        for (let i = 1; i <= 17; i++)
            yield MyMagnets.createMagnetRainbow(i);
    }

    /** Sorting (big) */
    static * magnetSortingBig(): Generator<HTMLElement> {
        for (let i = 1; i <= 17; i++) {
            const m = MyMagnets.createMagnetRainbow(i);
            m.style.fontSize = "96px";
            yield m;
        }
    }

    /** B-trees */
    static * magnetBTrees(): Generator<HTMLElement> {
        for (let i = 1; i <= 17; i++)
            yield MyMagnets.createMagnetRainbow(i);

        for (let i = 1; i <= 7; i++)
            yield MyMagnets.createMagnetImage("Btreenode.png");
    }

    /** Graphs */
    static * magnetGraphNodes(): Generator<HTMLElement> {
        for (const i of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']) {
            const m = MyMagnets.createMagnet(i);
            m.classList.add("graphNode");
            yield m;
        }
    }


    static * magnetFloydsAlgorithm(): Generator<HTMLElement> {
        yield MyMagnets.createMagnetImage("turtlerabbit/turtle.png");
        yield MyMagnets.createMagnetImage("turtlerabbit/rabbit.png");
    }

    static * magnetGraphSimCity(): Generator<HTMLElement> {
        const simCityPictures = ["antenne.png", "commerce.png", "parking.png", "tour.png",
            "batimentplat.png", "foursolaire.png", "residence2.png", "usine.png",
            "building.png", "gare.png", "residencebleu.png",
            "chateaudeau.png", "nuclearplant.png", "residence.png",
            "citerne.png", "parc.png", "stade.png"
        ];

        for (const name of simCityPictures) {
            yield MyMagnets.createMagnetImage("simCityGraph/" + name);
        }

    }

    /** Wang tile described with the colors*/
    static createWangTile(leftColor: string, upColor: string, rightColor: string, bottomColor: string): HTMLElement {
        const xmlns = "http://www.w3.org/2000/svg";

        const size = 100;
        const svgElem = <SVGElement>document.createElementNS(xmlns, "svg");
        svgElem.setAttributeNS(null, "viewBox", "0 0 " + size + " " + size);
        svgElem.setAttributeNS(null, "width", "" + size);
        svgElem.setAttributeNS(null, "height", "" + size);
        svgElem.style.display = "block";


        function createPath(pathDesc, color) {
            const path = document.createElementNS(xmlns, "path");
            path.setAttributeNS(null, 'stroke', "#333333");
            path.setAttributeNS(null, 'stroke-width', "" + 5);
            path.setAttributeNS(null, 'stroke-linejoin', "round");
            path.setAttributeNS(null, 'd', pathDesc);
            path.setAttributeNS(null, 'fill', color);
            path.setAttributeNS(null, 'opacity', "" + 1.0);
            return path;
        }

        svgElem.appendChild(createPath("M 50 50 L 0 0 L 0 100 Z", leftColor));
        svgElem.appendChild(createPath("M 50 50 L 0 0 L 100 0 Z", upColor));
        svgElem.appendChild(createPath("M 50 50 L 100 0 L 100 100 Z", rightColor));
        svgElem.appendChild(createPath("M 50, 50 L 100 100 L 0 100 Z", bottomColor));

        const div = document.createElement("div");
        div.appendChild(svgElem);
        div.style.padding = "0px";
        return div;

    }



    /** Tilings */
    /**
     * @description create a magnet with strings that are displayed (colors are infered from the ASCII codes of the string)
     */
    static createWangTileWithText(leftText: string, upText: string, rightText: string, bottomText: string): HTMLElement {
        const xmlns = "http://www.w3.org/2000/svg";

        const size = 100;
        const svgElem = <SVGElement>document.createElementNS(xmlns, "svg");
        svgElem.setAttributeNS(null, "viewBox", "0 0 " + size + " " + size);
        svgElem.setAttributeNS(null, "width", "" + size);
        svgElem.setAttributeNS(null, "height", "" + size);
        svgElem.style.display = "block";


        function createPath(pathDesc, color) {
            const path = document.createElementNS(xmlns, "path");
            path.setAttributeNS(null, 'stroke', "#333333");
            path.setAttributeNS(null, 'stroke-width', "" + 5);
            path.setAttributeNS(null, 'stroke-linejoin', "round");
            path.setAttributeNS(null, 'd', pathDesc);
            path.setAttributeNS(null, 'fill', color);
            path.setAttributeNS(null, 'opacity', "" + 1.0);
            return path;
        }


        function createText(x: number, y: number, str: string): SVGTextElement {
            const text = document.createElementNS(xmlns, "text");
            text.setAttributeNS(null, 'x', "" + x);
            text.setAttributeNS(null, 'y', "" + y);
            text.setAttributeNS(null, 'text-anchor', "middle");
            text.style.fontSize = "20px";
            text.textContent = str;
            return text;

        }

        const txtToInt = (str: string) => {
            let r = 0;
            for (let i = 0; i < str.length; i++) {
                r += str.charCodeAt(i)
            }
            return r;
        }

        const txtToColor = (str) => {
            const colors = ["white", "yellow", "lightgreen", "#88BBFF", "#AAAAFF", "orange", "#FFAAAA",
                "#FF7766", "#DDDDDD", "#FFFFAA", "#AAAAAA", "#EEFF33"];
            return colors[txtToInt(str) % colors.length]
        };

        svgElem.appendChild(createPath("M 50 50 L 0 0 L 0 100 Z", txtToColor(leftText)));
        svgElem.appendChild(createPath("M 50 50 L 0 0 L 100 0 Z", txtToColor(upText)));
        svgElem.appendChild(createPath("M 50 50 L 100 0 L 100 100 Z", txtToColor(rightText)));
        svgElem.appendChild(createPath("M 50, 50 L 100 100 L 0 100 Z", txtToColor(bottomText)));

        svgElem.appendChild(createText(25, 55, leftText));
        svgElem.appendChild(createText(75, 55, rightText));
        svgElem.appendChild(createText(50, 25, upText));
        svgElem.appendChild(createText(50, 90, bottomText));

        const div = document.createElement("div");
        div.appendChild(svgElem);
        div.style.padding = "0px";
        return div;

    }


    static * magnetTilings(): Generator<HTMLElement> {
        yield MyMagnets.createWangTile("yellow", "red", "green", "red");
        yield MyMagnets.createWangTile("green", "red", "green", "yellow");
        yield MyMagnets.createWangTile("green", "red", "green", "yellow");

        yield MyMagnets.createWangTile("red", "red", "red", "red");
        yield MyMagnets.createWangTile("red", "yellow", "red", "green");
        yield MyMagnets.createWangTile("red", "yellow", "yellow", "yellow");

        yield MyMagnets.createWangTile("green", "red", "green", "yellow");
        yield MyMagnets.createWangTile("green", "green", "red", "green");
        yield MyMagnets.createWangTile("red", "yellow", "red", "green");
    }


    static * magnetTilingsTM(): Generator<HTMLElement> {
        MagnetPositionner.resetPositionate();
        MagnetPositionner.setSeparationX(32);
        MagnetPositionner.setSeperationY(100);

        yield MyMagnets.createWangTileWithText("", "-", "", "q0,a");
        yield MyMagnets.createWangTileWithText("", "-", "", "a");
        yield MyMagnets.createWangTileWithText("", "-", "", "b");
        yield MyMagnets.createWangTileWithText("", "-", "", "");

        MagnetPositionner.newGroup();

        const states = ['q', 'q0'];
        const allLetters = ['a', 'b', ''];
        const letters = ['a', 'b'];
        for (const a of allLetters)
            yield MagnetPositionner.positionnate(MyMagnets.createWangTileWithText("", a, "", a));

        MagnetPositionner.newGroup();

        /**beginning of a transtion */
        for (const q of states)
            for (const q2 of states)
                for (const a of allLetters)
                    for (const b of letters) {
                        yield MagnetPositionner.positionnate(MyMagnets.createWangTileWithText("", `${q},${a}`, ``, `${q2},${b}`));
                    }

        MagnetPositionner.newGroup();

        for (const q of states)
            for (const q2 of states)
                for (const a of allLetters)
                    for (const b of letters)
                        yield MagnetPositionner.positionnate(MyMagnets.createWangTileWithText("", `${q},${a}`, `${q2}`, `${b}`));


        MagnetPositionner.newGroup();

        for (const q of states)
            for (const q2 of states)
                for (const a of allLetters)
                    for (const b of letters)
                        yield MagnetPositionner.positionnate(MyMagnets.createWangTileWithText(`${q2}`, `${q},${a}`, ``, `${b}`));


        MagnetPositionner.newGroup();

        /**
        * end of a transition
        */
        for (const q of states)
            for (const a of allLetters) {
                yield MagnetPositionner.positionnate(MyMagnets.createWangTileWithText("", `${a}`, `${q}`, `${q},${a}`));
                yield MagnetPositionner.positionnate(MyMagnets.createWangTileWithText(`${q}`, `${a}`, '', `${q},${a}`));
            }




    }

    static createMagnetStateAutomaton(content: string, final: boolean): HTMLElement {
        const o = document.createElement("div");
        o.style.backgroundColor = "#222222";
        o.style.borderRadius = "96px";
        o.style.color = "white";
        o.style.border = final ? "white double 10px" : "white solid 2px";
        o.style.padding = "16px";
        o.innerHTML = content;
        return o;
    }

    static * magnetStatesForAutomata(): Generator<HTMLElement> {
        for (const b of [false, true])
            for (const c of ["q", "q'", "q0", "q1", "q2", "q3", "q4", "q5"]) {
                yield MyMagnets.createMagnetStateAutomaton(c, b);
            }
    }

    static * magnetGo(): Generator<HTMLElement> {
        for (const { color, x } of [{ color: "black", x: 20 }, { color: "white", x: 50 }])
            for (let i = 0; i < 20; i++) {
                const img = MyMagnets.createMagnetImage("go/" + color + ".png");
                img.style.left = x + "px";
                img.style.top = 10 + i * 5 + "px";
                yield img;
            }

        const goban = MyMagnets.createMagnetImage("go/goban.png");
        goban.style.left = "110px";
        goban.style.top = "20px";
        yield goban;
    }



    static * magnetCars(): Generator<HTMLElement> {
        for (let i = 0; i < 360; i += 120) {
            const img = MyMagnets.createMagnetImage("car.svg");
            img.classList.add("car");
            img.style.filter = `hue-rotate(${i}deg)`;
            yield img;
        }

    }

    static * magnetCircles(): Generator<HTMLElement> {
        for (const size of [32, 48, 64, 80, 96, 128, 144, 164]) {
            const magnet = document.createElement("div");
            magnet.style.backgroundColor = `rgb(${255}, ${size}, ${size})`;
            magnet.style.width = size + "px";
            magnet.style.height = size + "px";
            magnet.style.borderRadius = size + "px";
            yield magnet;
        }
    }


    static * magnetCoin(): Generator<HTMLElement> {
        const magnet = document.createElement("img");
        magnet.src = "img/magnets/coin/face.svg";
        magnet.classList.add("backgroundTransparent");
        magnet.onclick = (evt) => {
            const item = <HTMLImageElement>evt.target;
            item.src = "img/magnets/coin/flipping.svg";
            setTimeout(() => { item.src = `img/magnets/coin/${Math.random() < 0.5 ? "face" : "pile"}.svg`; }, 1000);
        };
        yield magnet;
    }


    static * magnetDice(): Generator<HTMLElement> {
        const magnet = document.createElement("img");
        magnet.src = "img/magnets/dice/6.svg";
        magnet.classList.add("backgroundTransparent");
        magnet.onclick = (evt) => {
            const item = <HTMLImageElement>evt.target;
            item.src = "img/magnets/dice/anim.svg";
            setTimeout(() => { item.src = `img/magnets/dice/${1 + Math.floor(Math.random() * 6)}.svg`; }, 1000);
        };
        yield magnet;
    }




    static * magnetMapMarkers(): Generator<HTMLElement> {
        yield MyMagnets.createMagnetImage("mapmarkers/mapmarker_source.svg");
        yield MyMagnets.createMagnetImage("mapmarkers/mapmarker_target.svg");
    }



    static createMagnetCollectionButton(magnet: HTMLElement): HTMLButtonElement {
        const el = document.createElement("button"); //document.getElementById(magnetSetName)
        el.classList.add("magnetCollectionButton");
        el.appendChild(magnet);

        el.onclick = () => { MagnetManager.addMagnet(MagnetPositionner.positionnate((<HTMLElement>magnet.cloneNode(true)))); };
        return el;
    }
    /**
 *
 * @param magnetSetName
 * @description register a set of magnets. Add it to the magnet menu.
 */
    static registerMagnetCollection(magnetSetName: () => Generator<HTMLElement>): void {
        const wrapper = document.createElement("div");
        const snapshot = document.createElement("div");
        wrapper.appendChild(snapshot);
        wrapper.classList.add("wrapperMagnetPreview");
        snapshot.classList.add("magnetPreview");
        const ite = magnetSetName();
        const b = true;//to avoid a lint error
        while (b) {
            const m = ite.next();
            if (m.done)
                break;
            snapshot.appendChild(m.value);
        }

        const el = document.createElement("button"); //document.getElementById(magnetSetName)
        el.classList.add("magnetCollectionButton");
        el.prepend(document.createElement("br"));
        el.prepend(wrapper);
        el.onclick =
            () => {
                MagnetPositionner.resetPositionate();
                const ite = magnetSetName();
                const b = true;//to avoid a lint error

                while (b) {
                    const m = ite.next();
                    if (m.done)
                        break;
                    MagnetManager.addMagnet(MagnetPositionner.positionnate(m.value));
                }
            };
        document.getElementById("magnetCollection").appendChild(el);
    }




    static registerIndividualAndCollectionMagnets(magnetSetName: () => Generator<HTMLElement>): void {
        MyMagnets.registerIndividualMagnets(magnetSetName);
        MyMagnets.registerMagnetCollection(magnetSetName);
    }

    /**
*
* @param magnetSetName
* @description register a set of magnets. Add it to the magnet menu.
*/
    static registerIndividualMagnets(magnetSetName: () => Generator<HTMLElement>): void {
        const wrapper = document.createElement("div");
        const snapshot = document.createElement("div");
        wrapper.appendChild(snapshot);
        wrapper.classList.add("wrapperMagnetPreview");
        snapshot.classList.add("magnetPreview");
        const ite = magnetSetName();
        const b = true;//to avoid a lint error
        while (b) {
            const m = ite.next();
            if (m.done)
                break;


            document.getElementById("magnetCollection").appendChild(MyMagnets.createMagnetCollectionButton(m.value));

        }


    }



    static reset(): void {
        document.getElementById("magnetCollection").innerHTML = "";
    }


    static newSection(name: string): void {
        const el = document.createElement("h3");
        el.innerHTML = name;
        document.getElementById("magnetCollection").appendChild(el);
    }


    static newLine(): void {
        const el = document.createElement("br");
        document.getElementById("magnetCollection").appendChild(el);
    }

    static async loadMagnets(): Promise<void> {
        MyMagnets.reset();

        document.getElementById("magnetCollectionSearch").oninput = () => {
            const txt = (<HTMLInputElement>document.getElementById("magnetCollectionSearch")).value;
            const bSearch = (txt != "");

            document.getElementById("magnetCollection").hidden = bSearch;
            document.getElementById("magnetCollectionSearchResult").hidden = !bSearch;

            if (bSearch) {
                const emojisResult = emojis.filter((emoji) => emoji.tags.indexOf(txt) >= 0);
                document.getElementById("magnetCollectionSearchResult").innerHTML = "";
                if (emojisResult.length < 30) {
                    document.getElementById("magnetCollectionSearchResult").innerHTML = "";
                    for (const emoji of emojisResult) {
                        document.getElementById("magnetCollectionSearchResult").appendChild(this.createMagnetCollectionButton(openMojiMagnet(emoji.hexcode)));
                    }

                }
                else {
                    document.getElementById("magnetCollectionSearchResult").innerHTML = "too many magnets: please do not be shy and tell me more";
                }
            }
        }




        MyMagnets.newSection("Digits and letters");
        MyMagnets.registerIndividualAndCollectionMagnets(MyMagnets.magnetSorting);
        MyMagnets.newLine();

        MyMagnets.registerIndividualAndCollectionMagnets(MyMagnets.magnetGraphNodes);
        MyMagnets.registerMagnetCollection(MyMagnets.magnetBTrees);
        MyMagnets.registerMagnetCollection(MyMagnets.magnetStatesForAutomata);


        MyMagnets.newSection("Tilings");

        MyMagnets.registerMagnetCollection(MyMagnets.magnetTilings);
        MyMagnets.registerMagnetCollection(MyMagnets.magnetTilingsTM);

        /* MyMagnets.newSection("Buildings");
         MyMagnets.registerMagnetCollection(MyMagnets.magnetGraphSimCity);*/

        MyMagnets.newSection("Games");
        //MyMagnets.registerMagnetCollection("magnetFloydsAlgorithm");
        MyMagnets.registerMagnetCollection(MyMagnets.magnetGo);
        MyMagnets.registerMagnetCollection(MyMagnets.magnetCoin);
        MyMagnets.registerMagnetCollection(MyMagnets.magnetDice);
        MyMagnets.registerMagnetCollection(MyMagnets.magnetCircles);

        MyMagnets.newSection("Vehicules");
        MyMagnets.registerIndividualAndCollectionMagnets(MyMagnets.magnetCars);


        MyMagnets.newSection("Markers");
        MyMagnets.registerMagnetCollection(MyMagnets.magnetMapMarkers);

        try {
            await fetchAllEmojis();

            MyMagnets.newSection("Persons")
            MyMagnets.registerIndividualAndCollectionMagnets(explicitCollectionOpenMoji(["1F9D2", "1F9D1-200D-2695-FE0F", "1F469-200D-1F393", "1F468-200D-1F373", "1F9D1-200D-1F52C", "1F478", "1F9D1-200D-1F384", "1F9D9-200D-2640-FE0F", "1F9DA-200D-2642-FE0F", "1F9DE-200D-2642-FE0F"]));

            MyMagnets.newSection("Activities")
            MyMagnets.registerIndividualMagnets(collectionOpenMojiSlice("activities"));

            MyMagnets.newSection("Fruits and vegetables")
            MyMagnets.registerIndividualMagnets(collectionOpenMojiSlice("food-drink"));

            MyMagnets.newSection("Places")
            MyMagnets.registerIndividualMagnets(collectionOpenMojiSlice("travel-places"));
        }
        catch (e) {
            //no network! no internet!
            console.log(e)
        }








        /*     fetchAllEmojis().then(emojis => {
                 for (const emoji of emojis) {
                     const f = function* () {
                         const el = document.createElement("img");
                         console.log(emoji)
                         el.src = `https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/${emoji.hexcode}.svg`;
                         el.style.width = "96px";
                         yield el;
                     }
                     MyMagnets.registerIndividualMagnets(f);
                 }
             });
     */
    }
}
