import { OptionManager } from "./OptionManager";


/**
 * @description The class ToolDrawOptions manages the option for the drawing tool.
 * isSmoothing is true if the drawing is getting smoother after the drawing being made
 * isParticules is true if the drawing generates chalk particules
 */
export class ToolDrawOptions {

    private static _isSmoothing = false;
    private static _isParticules = false;

    static get isSmoothing() { return ToolDrawOptions._isSmoothing; }
    static get isParticules() { return ToolDrawOptions._isParticules; }

    static init() {
        OptionManager.boolean({
            name: "smoothing",
            defaultValue: true,
            onChange: (s) => { ToolDrawOptions._isSmoothing = s; }
        });
        OptionManager.boolean({
            name: "particulesEffect",
            defaultValue: false,
            onChange: (s) => { ToolDrawOptions._isParticules = s; }
        });
    }
}