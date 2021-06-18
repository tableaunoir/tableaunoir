import { MagnetTextManager } from './MagnetTextManager';
import { MagnetManager } from './magnetManager';
import { ActionSerialized } from './ActionSerialized';
import { getCanvas } from "./main";
import { Action } from "./Action";
import html2canvas from 'html2canvas';

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


	getOverviewImage(): string { return "url(img/icons/stamp.svg)"; }

	redo(): Promise<void> {
		return new Promise((resolve) => {
			const context = getCanvas().getContext("2d");
			const magnet = this.magnet;

			if (magnet instanceof HTMLImageElement) {

				const f = () => {

					const clipPath = magnet.style.clipPath;

					context.globalCompositeOperation = "source-over";
					context.globalAlpha = 1.0;

					if (clipPath != "") {
						const strPointsInClipPath = magnet.style.clipPath.substr("polygon(".length, clipPath.length - "polygon(".length - ")".length);

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

					context.drawImage(<HTMLImageElement>this.magnet, this.x, this.y);

					if (clipPath != "")
						context.restore();

					resolve();
				};

				if (magnet.complete)
					f();
				magnet.onload = f;

			}
			else if (MagnetTextManager.isTextMagnet(this.magnet)) {
				//html2canvas should do the job but sometimes it bugs, it does not take the scale into account...
				context.globalCompositeOperation = "source-over";
				context.globalAlpha = 1.0;
				const fontSize = 24;
				context.font = `${fontSize}px`;
				context.font = MagnetManager.getFont(this.magnet);
				context.fillStyle = MagnetManager.getTextColor(this.magnet);
				/*console.log(MagnetManager.getFont(this.magnet));
				console.log(MagnetManager.getText(this.magnet));*/
				let y = this.y + fontSize;
				for (const line of MagnetManager.getText(this.magnet).split("\n")) {
					context.fillText(line, this.x, y);
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