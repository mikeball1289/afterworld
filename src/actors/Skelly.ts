import World from "../world/World";
import Map from "../world/Map";
import Actor from "./Actor";

export class Skelly extends Actor {

    constructor(world: World) {
        super(world);
        
    }

    updateImpulse(map: Map) {

    }

    handleCollisions(collisions: [boolean, boolean]) {

    }
}