import { ActionSerialized } from './ActionSerialized';
import { getCanvas } from "./main";
import { Action } from "./Action";

export class ActionPrintMagnet extends Action {

	serializeData(): ActionSerialized {
		return {
			type: "printmagnet", 
			pause: this.pause, userid: this.userid, magnet: this.img.outerHTML,
			x: this.x, y: this.y
		};
	}

	constructor(userid: string, private img: HTMLImageElement, private x: number, private y: number) {
		super(userid);
	}


	redo(): Promise<void> {
		return new Promise((resolve) => {
			const img = this.img;

			const f = () => {
				let s = img.style.clipPath;
				const context = getCanvas().getContext("2d");
				s = s.substr("polygon(".length, s.length - "polygon(".length - ")".length);

				context.globalCompositeOperation = "source-over";
				context.globalAlpha = 1.0;
				context.save();
				context.beginPath();
				let begin = true;
				for (let pointStr of s.split(",")) {
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
				
				context.drawImage(this.img, this.x, this.y);

				context.restore();

				resolve();
			};

			if (img.complete)
				f();
			img.onload = f;
		});
	}

}