import JuggledSprite from "../display/JuggledSprite";

export default class PlayerCharacter extends JuggledSprite {

    public velocity = new PIXI.Point(0, 0);

    constructor() {
        super();
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xCC0555);
        graphics.drawRect(0, 0, 50, 50);
        graphics.endFill();
        this.addChild(graphics);
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + 50;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + 50;
    }
}