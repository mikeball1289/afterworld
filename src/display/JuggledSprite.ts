import {juggler} from "../root";

export class JuggledSprite extends PIXI.Sprite {

    private _oef: () => void;

    constructor(texture?: PIXI.Texture) {
        super(texture);
        this._oef = () => this.onEnterFrame();
        juggler.add(this._oef);
    }

    public onEnterFrame() { /* pass */ }

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        juggler.remove(this._oef);
        super.destroy();
    }
}
