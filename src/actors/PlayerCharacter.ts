import { keyboard } from "../root";
import * as Key from "../Key";
import World from "../world/World";
import Map from "../world/Map";
import Actor from "./Actor";
import * as PC from "../world/physicalConstants";

export enum PlayerEvents {
    MAP_TRAVEL = "map_travel"
}

export default class PlayerCharacter extends Actor {

    constructor(world: World) {
        super(world);
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xCC0555);
        graphics.drawRect(0, 0, 50, 50);
        graphics.endFill();
        this.addChild(graphics);
        this.size.x = 50;
        this.size.y = 50;
    }

    updateImpulse(map: Map) {
        let grounded = map.isGrounded(this);

        if (grounded) {
            if (keyboard.isKeyDown(Key.LEFT)) {
                this.velocity.x -= PC.WALK_IMPULSE;
            } else if (keyboard.isKeyDown(Key.RIGHT)) {
                this.velocity.x += PC.WALK_IMPULSE;
            } else {
                this.velocity.x *= PC.IDLE_GROUNDED_DECAY;
                if (Math.abs(this.velocity.x) < PC.EPSILON) this.velocity.x = 0;
            }
            if (Math.abs(this.velocity.x) > PC.HORIZONTAL_THRESHOLD) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
            if (keyboard.isKeyDown(Key.SPACE)) {
                if (keyboard.isKeyDown(Key.DOWN)) {
                    if (!Map.testLine({ x: this.left, y: this.bottom }, { x: this.right - PC.EPSILON, y: this.bottom },
                            (x, y) => Map.isSolid(map.getPixelData(x, y)), 2))
                    {
                        this.position.y += 2;
                    }
                } else {
                    this.velocity.y = -PC.JUMP_POWER;
                }
            } else if (keyboard.isKeyDown(Key.UP)) {
                this.world.attemptMapTransition();
            }

        } else { // we're flying through the sky!
            this.velocity.y += PC.GRAVITY;
            if (Math.abs(this.velocity.y) > PC.TERMINAL_VELOCITY) this.velocity.y *= PC.AERIAL_DRAG;
            if (keyboard.isKeyDown(Key.LEFT)) {
                if (this.velocity.x > 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x > -PC.HORIZONTAL_THRESHOLD) this.velocity.x -= PC.AERIAL_IMPULSE;
            } else if (keyboard.isKeyDown(Key.RIGHT)) {
                if (this.velocity.x < 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x < PC.HORIZONTAL_THRESHOLD) this.velocity.x += PC.AERIAL_IMPULSE;
            } else {
                if (Math.abs(this.velocity.x) > PC.HORIZONTAL_THRESHOLD) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
                else this.velocity.x *= PC.AERIAL_HORIZONTAL_DECAY;
            }
        }
    }

    handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) this.velocity.x = 0;
        if (collisions[1]) this.velocity.y = 0;
    }
}