import { juggler } from "./root";

export class JuggledSprite extends PIXI.Sprite {

    private _oef: () => void;

    constructor(texture?: PIXI.Texture | undefined) {
        super(texture);
        this._oef = this.onEnterFrame.bind(this);
        juggler.add(this._oef);
    }

    onEnterFrame() {
        
    }

    dispose() {
        juggler.remove(this._oef);
    }
}