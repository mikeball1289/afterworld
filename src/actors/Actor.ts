import World from "../world/World";
import Map from "../world/Map";
import * as EventEmitter from "events";

abstract class Actor extends PIXI.Sprite {

    public size: PIXI.Point = new PIXI.Point();
    public velocity = new PIXI.Point();
    public fallthrough?: number;

    constructor(public world: World) {
        super();
    }
    
    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.size.y;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.size.x;
    }

    get horizontalCenter() {
        return this.x + this.size.x / 2;
    }

    get verticalCenter() {
        return this.y + this.size.y / 2;
    }

    abstract updateImpulse(map: Map): void;
    abstract handleCollisions(collisions: [boolean, boolean]): void;
}

export default Actor;