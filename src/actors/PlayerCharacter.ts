// import JuggledSprite from "../display/JuggledSprite";
import Actor from "./Actor";

export default class PlayerCharacter extends Actor {

    constructor() {
        super();
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xCC0555);
        graphics.drawRect(0, 0, 50, 50);
        graphics.endFill();
        this.addChild(graphics);
        this.size.x = 50;
        this.size.y = 50;
    }
}