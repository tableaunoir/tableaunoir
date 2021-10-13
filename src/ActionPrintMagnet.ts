import { MagnetTextManager } from './MagnetTextManager';
import { MagnetManager } from './magnetManager';
import { ActionSerialized } from './ActionSerialized';
import { getCanvas } from "./main";
import { Action } from "./Action";

export class ActionPrintMagnet extends Action {

	get xMax(): number { return this.x + this.magnet.clientWidth; }

	private canvasImg: HTMLCanvasElement = undefined; //contains the preprocessed img of the HTMLElement

	serializeData(): ActionSerialized {
		return {
			type: "printmagnet",
			pause: this.pause, userid: this.userid, magnet: this.magnet.outerHTML,
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

				const f = () => {

					const clipPath = img.style.clipPath;

					context.globalCompositeOperation = "source-over";
					context.globalAlpha = 0.9;

					if (clipPath != "") {
						const strPointsInClipPath = img.style.clipPath.substr("polygon(".length, clipPath.length - "polygon(".length - ")".length);

						context.save();
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


					if (img.style.width) {
						const w = parseInt(img.style.width);
						const h = img.height * w / img.width;
						console.log(w);
						console.log(h);
						context.drawImage(img,
							///	0, 0, img.naturalWidth, img.naturalHeight,
							this.x, this.y, w, h
						);
					}
					else
						context.drawImage(img, this.x, this.y);

					if (clipPath != "")
						context.restore();

					resolve();
				};

				if (img.complete)
					f();
				img.onload = f;

			}
			else if (MagnetTextManager.isTextMagnet(this.magnet)) {
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
			}
			else {
				//html2canvas does not work
				/*	if (this.canvasImg == undefined)
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
					}*/
			}
		});
	}

}



function contextSetFontSize(context, fontSize) {
	const fontArgs = context.font.split(' ');
	context.font = fontSize + "px" + ' ' + fontArgs[fontArgs.length - 1];
}