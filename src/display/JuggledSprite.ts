import { juggler } from "../root";

export default class JuggledSprite extends PIXI.Sprite {

    private _oef: () => void;

    constructor(texture?: PIXI.Texture) {
        super(texture);
        this._oef = () => this.onEnterFrame();
        juggler.add(this._oef);
    }

    onEnterFrame() {
        
    }

    dispose() {
        juggler.remove(this._oef);
    }
}