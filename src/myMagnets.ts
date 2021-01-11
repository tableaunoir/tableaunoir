import { Share } from './share';
import { MagnetManager } from './magnetManager';




export class MyMagnets {

    static createMagnet(content: string): HTMLElement {
        const o = document.createElement("div");
        o.style.backgroundColor = "#EEEEEE";
        o.innerHTML = content;
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


    static magnetsClear(): void {
        Share.execute("magnetsClear", []);
    }


    /** Gale-Shapley */
    
    static createMagnetGS_B(content: string): HTMLElement {
        const o = document.createElement("div");
        o.innerHTML = content;
        o.classList.add("GS_B")
        return o;
    }


    static * magnetGS(): Generator<HTMLElement> {
        yield MyMagnets.createMagnet("1");
        yield MyMagnets.createMagnet("2");
        yield MyMagnets.createMagnet("3");
        yield MyMagnets.createMagnetGS_B("1");
        yield MyMagnets.createMagnetGS_B("2");
        yield MyMagnets.createMagnetGS_B("3");
    }

    /** Sorting */

    static createMagnetRainbow(content: number): HTMLElement {
        const o = MyMagnets.createMagnet("" + content);
        const colors = ['rgb(139, 97, 195)', 'rgb(115, 97, 195)', 'rgb(93, 105, 214)', 'rgb(40, 167, 226)', 'rgb(40, 204, 226)', 'rgb(40, 226, 201)', 'rgb(40, 226, 148)',
            'rgb(40, 226, 102)', 'rgb(130, 226, 40)', 'rgb(170, 226, 40)', 'rgb(223, 226, 40)', 'rgb(226, 183, 40)',
            'rgb(226, 152, 40)', 'rgb(226, 124, 40)', 'rgb(226, 77, 40)', 'rgb(255, 0, 0)', 'rgb(144, 24, 24)'];
        o.style.backgroundColor = colors[content - 1];
        return o;
    }


    static * magnetSorting(): Generator<HTMLElement> {
        for (let i = 1; i <= 17; i++)
            yield MyMagnets.createMagnetRainbow(i);
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
        //MagnetManager.clearMagnet();
        for (const i of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'])
            yield MyMagnets.createMagnet(i);
    }


    static * magnetFloydsAlgorithm(): Generator<HTMLElement> {
        yield MyMagnets.createMagnetImage("turtlerabbit/turtle.png");
        yield MyMagnets.createMagnetImage("turtlerabbit/rabbit.png");

    }

    static * magnetGraphSimCity(): Generator<HTMLElement> {
        //MagnetManager.clearMagnet();

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

    /** Tilings */

    static createTiling(leftColor: string, upColor: string, rightColor: string, bottomColor: string): HTMLElement {
        const xmlns = "http://www.w3.org/2000/svg";
        const div = document.createElement("div");
        const size = 100;
        const svgElem = <SVGElement>document.createElementNS(xmlns, "svg");
        svgElem.setAttributeNS(null, "viewBox", "0 0 " + size + " " + size);
        svgElem.setAttributeNS(null, "width", "" + size);
        svgElem.setAttributeNS(null, "height", "" + size);
        svgElem.style.display = "block";


        function createPath(pathDesc, color) {
            const path = document.createElementNS(xmlns, "path");
            path.setAttributeNS(null, 'stroke', "#333333");
            path.setAttributeNS(null, 'stroke-width', "" + 10);
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
        div.appendChild(svgElem);
        div.style.padding = "0px";
        return div;

    }


    static * magnetTilings(): Generator<HTMLElement> {
        MagnetManager.clearMagnet();
        yield MyMagnets.createTiling("yellow", "red", "green", "red");
        yield MyMagnets.createTiling("green", "red", "green", "yellow");
        yield MyMagnets.createTiling("green", "red", "green", "yellow");

        yield MyMagnets.createTiling("red", "red", "red", "red");
        yield MyMagnets.createTiling("red", "yellow", "red", "green");
        yield MyMagnets.createTiling("red", "yellow", "yellow", "yellow");

        yield MyMagnets.createTiling("green", "red", "green", "yellow");
        yield MyMagnets.createTiling("green", "green", "red", "green");
        yield MyMagnets.createTiling("red", "yellow", "red", "green");
    }








    static * magnetGo(): Generator<HTMLElement> {
        MagnetManager.clearMagnet();

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


    /**
 *
 * @param magnetSetName
 * @description register a set of magnets. Add it to the magnet menu.
 */
    static register(magnetSetName: string): void {
        const wrapper = document.createElement("div");
        const snapshot = document.createElement("div");
        wrapper.appendChild(snapshot);
        wrapper.classList.add("wrapperMagnetPreview");
        snapshot.classList.add("magnetPreview");
        const ite = MyMagnets[magnetSetName]();

        while (true) {
            const m = ite.next();
            console.log(m)
            if (m.done)
                break;
            snapshot.appendChild(m.value);
        }

        document.getElementById(magnetSetName).prepend(document.createElement("br"));
        document.getElementById(magnetSetName).prepend(wrapper);
        document.getElementById(magnetSetName).onclick =
            () => {
                MagnetManager.resetPositionate();
                const ite = MyMagnets[magnetSetName]();

                while (true) {
                    const m = ite.next();
                    console.log(m)
                    if (m.done)
                        break;
                    MagnetManager.addMagnetAndPositionnate(m.value);
                }
            };
    }




    static loadMagnets(): void {
        MyMagnets.register("magnetGS");
        MyMagnets.register("magnetSorting");
        MyMagnets.register("magnetBTrees");
        MyMagnets.register("magnetGraphNodes");
        MyMagnets.register("magnetTilings");
        MyMagnets.register("magnetGraphSimCity");
        MyMagnets.register("magnetFloydsAlgorithm");
        MyMagnets.register("magnetGo");
    }
}
