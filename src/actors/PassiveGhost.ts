import Animator from "../display/Animator";
import { fromTextureCache } from "../pixiTools";
import Map from "../world/Map";
import { EPSILON, GRAVITY } from "../world/physicalConstants";
import World from "../world/World";
import Enemy from "./Enemy";
import Player from "./Player";

export enum MovementStates {
    IDLE,
    WALKING,
    DEAD,
}

const WALK_IMPULSE = 0.15;
const IDLE_GROUNDED_DECAY = 0.85;
const HORIZONTAL_THRESHOLD = 0.4;
const FULL_HORIZONTAL_DECAY = 0.88;

const MAX_HEALTH = 10;

export default class PassiveGhost extends Enemy {
    public weight = 1;
    public maxHealth = MAX_HEALTH;
    public animator: Animator<{
        idle: [number, number];
        beginAttack: [number, number];
        attack: [number, number];
        curious: [number, number];
        die: [number, number];
    }>;

    private _state = MovementStates.IDLE;

    private goingUp: boolean = false;

    set state(val: MovementStates) {
        this._state = val;
    }

    get state() {
        return this._state;
    }

    get collideable() {
        return this.state !== MovementStates.DEAD;
    }

    constructor(world: World, spriteSheetName: string = "/images/ghost_sheet.png") {
        super(world);
        this.size.x = 40;
        this.size.y = 40;

        this.animator = new Animator(fromTextureCache(spriteSheetName), new PIXI.Point(50, 50), {
            idle: [0, 2],
            beginAttack: [1, 2],
            attack: [2, 1],
            curious: [3, 3],
            die: [4, 3],
        }, "idle", 4);
        this.animator.scale.set(1.5);
        this.animator.anchor.set(0.5, 1);
        this.animator.x = this.size.x / 2;
        this.animator.y = this.size.y;
        this.addChild(this.animator);

        this.health = MAX_HEALTH;
        this.direction = Math.random() < 0.5 ? -1 : 1;
    }

    public walk() {
        this.velocity.x += WALK_IMPULSE * this.direction;
        if (Math.abs(this.velocity.x) > HORIZONTAL_THRESHOLD) this.velocity.x *= FULL_HORIZONTAL_DECAY;
    }

    public stand() {
        this.velocity.x *= IDLE_GROUNDED_DECAY;
        if (Math.abs(this.velocity.x) < EPSILON) this.velocity.x = 0;
    }

    public isFearless(map: Map) {
        return Map.isFearless(map.getPixelData(this.left, this.bottom + EPSILON)) || Map.isFearless(map.getPixelData(this.right, this.bottom + EPSILON));
    }

    public handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) {
            if (this.state === MovementStates.WALKING) {
                if (this.velocity.x < 0) {
                    this.direction = 1;
                } else {
                    this.direction = -1;
                }
            }
            this.velocity.x = 0;
        }
        if (collisions[1]) this.velocity.y = 0;
    }

    public isDead() {
        return this.state === MovementStates.DEAD;
    }

    public die(damage: number = 0, knockback: PIXI.Point = new PIXI.Point()) {
        this.velocity.set(0);
        this.animator.play("die", {
            onComplete: () => {
                this.world.actorManager.removeEnemy(this);
                this.destroy();
            },
            onProgress: (frame) => {
                this.healthBar.alpha = 1 - (frame / 3);
            },
        } );
        this.state = MovementStates.DEAD;
    }

    public updateImpulse(map: Map, player?: Player): void {
        if (this.state === MovementStates.DEAD) return;
        if (!map.isGrounded(this)) {
            this.velocity.y += GRAVITY;
            return;
        }

        if (this.buffs.hasCondition("stunned")) {
            this.idleUpdate(map, player);
        } else if (this.state === MovementStates.IDLE) {
            this.idleUpdate(map, player);
        } else if (this.state === MovementStates.WALKING) {
            this.walkingUpdate(map, player);
        }
    }

    private idleUpdate(map: Map, player?: Player) {
        this.stand();
        if (Math.random() < 1 / 300) {
            this.animator.play("curious");
        }
        if (Math.random() < 1 / 200) {
            this.state = MovementStates.WALKING;
            if (Math.random() < 1 / 2) {
                this.direction *= -1;
            }
        } else {
            if (!this.isFearless(map)) {
                if (!Map.isWalkable(map.getPixelData(this.left, this.bottom))) {
                    this.state = MovementStates.WALKING;
                    this.direction = 1;
                } else if (this.direction > 0 && !Map.isWalkable(map.getPixelData(this.right, this.bottom))) {
                    this.state = MovementStates.WALKING;
                    this.direction = -1;
                }
            }
        }
    }

    private walkingUpdate(map: Map, player?: Player) {
        if (!this.isFearless(map)) {
            if (this.direction < 0 && !Map.isWalkable(map.getPixelData(this.left, this.bottom))) {
                this.direction = 1;
            } else if (this.direction > 0 && !Map.isWalkable(map.getPixelData(this.right, this.bottom))) {
                this.direction = -1;
            }
        }

        this.walk();

        if (Math.random() < 1 / 300) {
            this.state = MovementStates.IDLE;
        } else if (Math.random() < 1 / 150) {
            this.direction *= -1;
        }

        if (Math.random() < 1 / 10000) {
            this.goingUp = !this.goingUp;
        }
        if (this.goingUp) {
            if ((this.direction < 0 && Map.isWalkable(map.getPixelData(this.left, this.bottom - 2 - EPSILON)))  ||
                (this.direction > 0 && Map.isWalkable(map.getPixelData(this.right - EPSILON, this.bottom - 2 - EPSILON))))
            {
                this.y -= 2;
            }
        }
    }

}
