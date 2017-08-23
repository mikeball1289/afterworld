import Animator from "../display/Animator";
import HealthBar from "../display/HealthBar";
import { fromTextureCache } from "../pixiTools";
import { soundManager } from "../root";
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

    public animator: Animator<{
        idle: [number, number];
        beginAttack: [number, number];
        attack: [number, number];
        curious: [number, number];
        die: [number, number];
    }>;

    private _state = MovementStates.IDLE;
    private _direction: -1 | 1 = 1;
    private healthBar: HealthBar;

    private goingUp: boolean = false;

    set state(val: MovementStates) {
        this._state = val;
    }

    get state() {
        return this._state;
    }

    set direction(val: -1 | 1) {
        if (this._direction !== val) {
            this._direction = val;
            this.animator.scale.x = 1.5 * val;
        }
    }

    get direction() {
        return this._direction;
    }

    get collideable() {
        return this.state !== MovementStates.DEAD;
    }

    private _health: number;
    set health(val: number) {
        val = Math.max(val, 0);
        this._health = val;
        if (this.healthBar && this.world) {
            this.healthBar.setAmount(this._health / MAX_HEALTH);
            if (this._health < MAX_HEALTH) this.world.uiManager.worldLayers[0].addChild(this.healthBar);
        }
        if (this.parent) this.parent.addChild(this);
    }

    get health() {
        return this._health;
    }

    constructor(world: World) {
        super(world);
        this.size.x = 40;
        this.size.y = 40;

        this.animator = new Animator(fromTextureCache("/images/ghost_sheet.png"), new PIXI.Point(50, 50), {
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
        this.healthBar = new HealthBar();

        this.health = MAX_HEALTH;
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

    public frameUpdate() {
        super.frameUpdate();
        this.healthBar.x = this.horizontalCenter;
        this.healthBar.y = this.top - 40;
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
                this.healthBar.alpha = 1 - (frame / 7);
            },
        } );
        this.state = MovementStates.DEAD;
    }

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        super.destroy(options);
        if (this.healthBar.parent) this.healthBar.parent.removeChild(this.healthBar);
        this.healthBar.destroy();
        this.world = <any> undefined;
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
