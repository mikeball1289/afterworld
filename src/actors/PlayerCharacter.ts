import { hasInput, InputType, juggler } from "../root";
import World from "../world/World";
import Map from "../world/Map";
import Actor from "./Actor";
import * as PC from "../world/physicalConstants";
import Animator from "../display/Animator";

type PlayerAnimations = {
    idle: [number, number];
    walk: [number, number];
    jump: [number, number];
}

export default class PlayerCharacter extends Actor {

    private sprite: PIXI.Sprite;
    private body: {
        head: PIXI.Sprite;
        body: Animator<PlayerAnimations>;
    };

    constructor(world: World) {
        super(world);
        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);
        this.body = {
            head: new PIXI.Sprite(PIXI.loader.resources["/images/head_base.png"].texture),
            body: new Animator(PIXI.loader.resources["/images/body_base.png"].texture, new PIXI.Point(64, 128), {
                idle: [1, 1],
                walk: [0, 4],
                jump: [2, 1],
            }, "idle", 6),
        }
        this.sprite.addChild(this.body.body);
        this.sprite.addChild(this.body.head);
        this.body.body.anchor.set(0.5, 1);
        this.body.head.anchor.set(0.5, 1);
        this.size.x = 32;
        this.size.y = 80;
        this.sprite.x = this.size.x / 2;
        this.sprite.y = this.size.y;

        // this.sprite.x = this.size.x / 2 - this.sprite.width / 2;
        // this.sprite.y = this.size.y - this.sprite.height;
    }

    jumpBuffer: boolean = true;
    interactBuffer: boolean = true;

    updateImpulse(map: Map, getControls = true) {
        let grounded = map.isGrounded(this);

        if (this.fallthrough && Math.abs(this.y - this.fallthrough) >= 5) {
            this.fallthrough = undefined;
        }
        
        if (grounded) {
            if (getControls && hasInput(InputType.LEFT)) {
                this.velocity.x -= PC.WALK_IMPULSE;
                this.sprite.scale.x = -1;
                this.body.body.play("walk");
            } else if (getControls && hasInput(InputType.RIGHT)) {
                this.velocity.x += PC.WALK_IMPULSE;
                this.sprite.scale.x = 1;
                this.body.body.play("walk");
            } else {
                this.velocity.x *= PC.IDLE_GROUNDED_DECAY;
                if (Math.abs(this.velocity.x) < PC.EPSILON) this.velocity.x = 0;
                this.body.body.play("idle");
            }
            if (Math.abs(this.velocity.x) > PC.HORIZONTAL_THRESHOLD) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
            if (getControls && hasInput(InputType.JUMP) && this.jumpBuffer) {
                if (getControls && hasInput(InputType.DOWN)) {
                    if (!Map.testLine({ x: this.left, y: this.bottom }, { x: this.right - PC.EPSILON, y: this.bottom },
                            (x, y) => !Map.isDroppable(map.getPixelData(x, y)), 2))
                    {
                        // this.position.y += 2;
                        this.jumpBuffer = false;
                        this.fallthrough = this.y;
                        this.velocity.y = -PC.FALLTHROUGH_JUMP_POWER;
                        this.velocity.x = 0;
                    }
                } else {
                    this.velocity.y = -PC.JUMP_POWER;
                    this.jumpBuffer = false;
                }
            } else if (getControls && hasInput(InputType.UP)) {
                this.world.attemptMapTransition();
            }

        } else { // we're flying through the sky!
        this.body.body.play("jump");
            this.velocity.y += PC.GRAVITY;
            if (Math.abs(this.velocity.y) > PC.TERMINAL_VELOCITY) this.velocity.y *= PC.AERIAL_DRAG;
            if (getControls && hasInput(InputType.LEFT)) {
                if (this.velocity.x > 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x > -PC.HORIZONTAL_THRESHOLD) this.velocity.x -= PC.AERIAL_IMPULSE;
            } else if (getControls && hasInput(InputType.RIGHT)) {
                if (this.velocity.x < 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x < PC.HORIZONTAL_THRESHOLD) this.velocity.x += PC.AERIAL_IMPULSE;
            } else {
                if (Math.abs(this.velocity.x) > PC.HORIZONTAL_THRESHOLD) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
                else this.velocity.x *= PC.AERIAL_HORIZONTAL_DECAY;
            }
        }

        if (!hasInput(InputType.JUMP)) {
            this.jumpBuffer = true;
        }

        if (getControls) {
            if (hasInput(InputType.INTERACT)) {
                if (this.interactBuffer) {
                    this.world.attemptInteraction();
                    this.interactBuffer = false;
                }
            } else {
                this.interactBuffer = true;
            }
        }
    }

    handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) this.velocity.x = 0;
        if (collisions[1]) this.velocity.y = 0;
    }
}