import JuggledSprite from "../display/JuggledSprite";

export default class Actor extends JuggledSprite {

    public size: PIXI.Point = new PIXI.Point;
    public velocity = new PIXI.Point(0, 0);

    constructor() {
        super();
    }
    
    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.size.x;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.size.y;
    }
}