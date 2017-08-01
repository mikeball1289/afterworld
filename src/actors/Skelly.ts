import Animator from "../display/Animator";
import World from "../world/World";
import Map from "../world/Map";
import NonPlayerActor from "./NonPlayerActor";
import PlayerCharacter from "./PlayerCharacter";
import { EPSILON, GRAVITY } from "../world/physicalConstants";

enum MovementStates {
    IDLE,
    WALKING,
    CHASING,
}

const WALK_IMPULSE = 0.1;
const IDLE_GROUNDED_DECAY = 0.85;
const HORIZONTAL_THRESHOLD = 0.4;
const FULL_HORIZONTAL_DECAY = 0.88;

export default class Skelly extends NonPlayerActor {

    private animator: Animator<{
        idle: [number, number];
        walk: [number, number];
        attack: [number, number];
        die: [number, number];
    }>;

    private state = MovementStates.IDLE;
    private _direction: -1 | 1 = 1;

    set direction(val: -1 | 1) {
        this._direction = val;
        this.animator.scale.x = 1.5 * val;
    }

    get direction() {
        return this._direction;
    }

    constructor(world: World) {
        super(world);
        this.size.x = 33;
        this.size.y = 60;

        this.animator = new Animator(PIXI.loader.resources["/images/skelly_sheet.png"].texture, new PIXI.Point(64, 64), {
                                    idle: [0, 4],
                                    walk: [1, 4],
                                    attack: [2, 4],
                                    die: [3, 7],
                                }, "idle", 4);
        this.animator.scale.set(1.5);
        this.animator.anchor.set(0.5, 1);
        this.animator.x = this.size.x / 2;
        this.animator.y = this.size.y + 4;
        this.addChild(this.animator);
    }

    updateImpulse(map: Map, player?: PlayerCharacter): void {
        if (!map.isGrounded(this)) {
            this.velocity.y += GRAVITY;
        }

        switch(this.state) {
            case MovementStates.IDLE: {
                this.animator.play("idle");

                this.velocity.x *= IDLE_GROUNDED_DECAY;
                if (Math.abs(this.velocity.x) < EPSILON) this.velocity.x = 0;

                if (Math.random() < 1 / 300) {
                    this.state = MovementStates.WALKING;
                    if (Math.random() < 1 / 2) {
                        this.direction *= -1;
                    }
                }
                
                break;
            }
            case MovementStates.WALKING: {
                this.animator.play("walk");

                if (this.direction < 0 && !Map.isWalkable(map.getPixelData(this.left, this.bottom))) {
                    this.direction = 1;
                } else if (this.direction > 0 && !Map.isWalkable(map.getPixelData(this.right, this.bottom))) {
                    this.direction = -1;
                }
                
                this.velocity.x += WALK_IMPULSE * this.direction;

                if (Math.abs(this.velocity.x) > HORIZONTAL_THRESHOLD) this.velocity.x *= FULL_HORIZONTAL_DECAY;
                if (Math.random() < 1 / 300) {
                    this.state = MovementStates.IDLE;
                } else if (Math.random() < 1 / 150) {
                    this.direction *= -1;
                }
                
                break;
            }
            case MovementStates.CHASING: {
                this.animator.play("walk");
                if (!player) {
                    this.state = MovementStates.WALKING;
                    return this.updateImpulse(map, player);
                }
                break;
            }
        }
    }

    handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) {
            this.velocity.x = 0;
            if (this.state === MovementStates.WALKING) this.direction *= -1;
        }
        if (collisions[1]) this.velocity.y = 0;
    }
}