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
		this.magnet = <HTMLElement> magnet.cloneNode(true);
		
	}


	redo(): Promise<void> {
		return new Promise((resolve) => {
			const context = getCanvas().getContext("2d");
			const magnet = this.magnet;

			if (magnet instanceof HTMLImageElement) {

				const f = () => {

					const clipPath = magnet.style.clipPath;
					if (clipPath != "") {
						const strPointsInClipPath = magnet.style.clipPath.substr("polygon(".length, clipPath.length - "polygon(".length - ")".length);

						context.globalCompositeOperation = "source-over";
						context.globalAlpha = 1.0;
						context.save();
						context.beginPath();
						let begin = true;
						for (let pointStr of strPointsInClipPath.split(",")) {
							pointStr = pointStr.trim();
							const a = pointStr.split(" ");
							if (begin)
								context.moveTo(this.x + parseInt(a[0]), this.y + parseInt(a[1]));
							else
								context.lineTo(this.x + parseInt(a[0]), this.y + parseInt(a[1]));
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
			else if(MagnetManager.isTextMagnet(this.magnet)) {
				//html2canvas should do the job but sometimes it bugs, it does not take the scale into account...
				context.font = `${24}px  Arial`;
				context.fillStyle = (<HTMLElement> this.magnet.children[0]).style.color;
				context.fillText(MagnetManager.getText(this.magnet), this.x, this.y+24);
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