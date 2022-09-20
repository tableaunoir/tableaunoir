import { ActionSerialized } from './ActionSerialized';
import { getCanvas } from "./main";
import { Action } from "./Action";


/**
 * action that consists in printing (pasting) the magnet
 */
export class ActionPrintMagnet extends Action {

	get xMax(): number { return this.x + this.magnet.clientWidth; }

	private canvasImg: HTMLCanvasElement = undefined; //contains the preprocessed img of the HTMLElement

	serializeData(): ActionSerialized {
		return {
			type: "printmagnet",
			userid: this.userid, magnet: this.magnet.outerHTML,
			x: this.x, y: this.y
		};
	}

	private magnet: HTMLElement;
	constructor(userid: string, magnet: HTMLElement, private x: number, private y: number) {
		super(userid);
		this.magnet = <HTMLElement>magnet.cloneNode(true);

	}


	createOverviewImage(): string { return "url(img/icons/stamp.svg)"; }

	redo(): Promise<void> {
		return new Promise((resolve) => {
			const context = getCanvas().getContext("2d");

			if (this.magnet instanceof HTMLImageElement) {

				const img = <HTMLImageElement>this.magnet;

				const printImage = () => {



					context.globalCompositeOperation = "source-over";
					context.globalAlpha = 0.9;
					context.save();
					const clipPath = img.style.clipPath;
					if (clipPath != "") {
						const strPointsInClipPath = img.style.clipPath.substr("polygon(".length, clipPath.length - "polygon(".length - ")".length);


						context.beginPath();
						let begin = true;
						for (const pointStr of strPointsInClipPath.split(",")) {
							const point = pointStr.trim().split(" ");
							if (begin)
								context.moveTo(this.x + parseInt(point[0]), this.y + parseInt(point[1]));
							else
								context.lineTo(this.x + parseInt(point[0]), this.y + parseInt(point[1]));
							begin = false;
						}
						context.closePath();
						context.clip();
					}

					const w = img.style.width ? parseInt(img.style.width) : img.width;
					const h = img.height * w / img.width;

					context.translate(this.x + w / 2, this.y + h / 2);
					if (img.style.transform != "") {
						if (img.style.transform.startsWith("rotate(") && img.style.transform.endsWith("rad)")) {
							const args = img.style.transform.split("(");
							const angle = parseFloat(args[1]);
							context.rotate(angle);
						}
					}


					context.filter = img.style.filter;
					context.drawImage(img, -w / 2, -h / 2, w, h);
					context.filter = "none";
					context.restore();

					resolve();
				};
				console.log("printing magnet. img.complete = " + img.complete);
				if (img.complete)
					printImage();
				else
					img.onload = printImage;

			}
			/* issue #191: actually printing a text magnet is not robust enough
			 and it is not useful
			 better to remove the functionnality
			*/
			/*else if (MagnetTextManager.isTextMagnet(this.magnet)) {
				//html2canvas should do the job but sometimes it bugs, it does not take the scale into account...
				context.globalCompositeOperation = "source-over";
				context.globalAlpha = 1.0;
				//TODO: needs to be cleaned
				const fontSize = 24;
				const SHIFTX = 8;
				const SHIFTY = 8;
				contextSetFontSize(context, fontSize);
				context.fillStyle = MagnetManager.getTextColor(this.magnet);
				console.log(MagnetManager.getFont(this.magnet));
				console.log(MagnetManager.getText(this.magnet));
				console.log(MagnetManager.getTextColor(this.magnet));
				let y = this.y + fontSize;
				for (const line of MagnetManager.getText(this.magnet).split("\n")) {
					context.fillText(line, this.x + SHIFTX, y + SHIFTY);
					y = y += fontSize;
				}
	
				resolve();
			}*/
			/*else {
				//html2canvas does not work
					if (this.canvasImg == undefined)
						try {
							html2canvas(magnet).then(canvas => {
								try {
									this.canvasImg = canvas;
									context.drawImage(this.canvasImg, this.x, this.y);
									resolve();
								}
								catch (e) {
									console.log("error");
									resolve();
								}
							});
						}
						catch (e) {
							console.log("error");
							resolve();
						}
	
					else {
						context.drawImage(this.canvasImg, this.x, this.y);
						resolve();
					}
			}*/
		});
	}

}


/**
function contextSetFontSize(context, fontSize) {
	const fontArgs = context.font.split(' ');
	context.font = fontSize + "px" + ' ' + fontArgs[fontArgs.length - 1];
}
 */