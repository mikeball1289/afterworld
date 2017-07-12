import {JuggledSprite} from "./display/JuggledSprite";

export class TestSprite extends JuggledSprite {
    
    constructor() {
        super(PIXI.Texture.fromImage("/images/sample.png"));
    }

    private counter = 0;

    onEnterFrame() {
        super.onEnterFrame();
        this.counter ++;
        console.log("Frame: " + this.counter);
        this.x ++;
        this.y ++;
    }
}