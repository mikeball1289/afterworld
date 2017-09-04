import Animator from "../../display/Animator";
import { fromTextureCache } from "../../pixiTools";
import WilloFlame from "../../projectiles/WilloFlame";
import Map from "../../world/Map";
import World from "../../world/World";
import Enemy from "../Enemy";
import Player from "../Player";

export enum MovementStates {
    FLOATING,
    ATTACKING,
    DEAD,
}

const IMPULSE = 0.02;
const DECAY = 0.95;
const ATTACK_TIME = 240;

const MAX_HEALTH = 10;

export default class WilloSpirit extends Enemy {
    public static PRETTY_NAME = "Willo Spirit";

    public enemyName = WilloSpirit.PRETTY_NAME;
    public weight = 1;
    public maxHealth = MAX_HEALTH;
    public animator: Animator<{
        idle: [number, number];
        curious: [number, number];
        die: [number, number];
    }>;

    private _state = MovementStates.FLOATING;
    private yTarget = 0;
    private attackDelay = 0;
    private sinTime = 0;

    set state(val: MovementStates) {
        this._state = val;
    }

    get state() {
        return this._state;
    }

    constructor(world: World) {
        super(world);
        this.size.x = 40;
        this.size.y = 40;
        this.tangible = false;

        this.animator = new Animator(fromTextureCache("/images/ghost_sheet.png"), new PIXI.Point(50, 50), {
            idle: [0, 2],
            curious: [3, 3],
            die: [4, 3],
        }, "idle", 4);
        this.animator.scale.set(1.5);
        this.animator.anchor.set(0.5, 1);
        this.animator.x = this.size.x / 2;
        this.animator.y = this.size.y;
        this.animator.tints.addTint(0xAAFFAA);
        this.addChild(this.animator);

        this.health = MAX_HEALTH;
        this.direction = Math.random() < 0.5 ? -1 : 1;
    }

    public setBottomCenter(x: number, y: number) {
        this.yTarget = y - this.size.y / 2 + 40 * (Math.random() < 0.5 ? -1 : 1);
        return super.setBottomCenter(x, y);
    }

    public handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) {
            this.velocity.x *= -1;
            this.direction *= -1;
        }
        if (collisions[1]) {
            if (this.velocity.y > 0) {
                this.yTarget = this.verticalCenter - 40;
            } else {
                this.yTarget = this.verticalCenter + 40;
            }
            this.velocity.y *= -1;
        }
    }

    public isDead() {
        return this.state === MovementStates.DEAD;
    }

    public die(damage: number = 0, knockback: PIXI.Point = new PIXI.Point()) {
        this.animator.fps = 4;
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

        this.velocity.x *= DECAY;
        this.velocity.y *= DECAY;
        this.sinTime ++;

        if (this.buffs.hasCondition("stunned")) {
            return;
        } else if (this.state === MovementStates.FLOATING) {
            this.floatingUpdate(map, player);
        }
    }

    private floatingUpdate(map: Map, player?: Player) {
        if (this.verticalCenter < this.yTarget + Math.sin(this.sinTime / 120 * Math.PI) * 40) {
            this.velocity.y += IMPULSE;
        } else {
            this.velocity.y -= IMPULSE;
        }
        this.velocity.x += IMPULSE * this.direction;

        if (player && Math.random() < 1 / 180) {
            let offset = 40;
            if (player.verticalCenter < this.verticalCenter) offset *= -1;
            if (Math.random() < 4 / 10) offset *= -1;
            this.yTarget += offset;
        }
        if (Math.random() < 1 / 300) {
            this.direction *= -1;
        }

        this.attackDelay ++;
        if (player && this.distanceTo(player.center) < 500 && this.attackDelay >= ATTACK_TIME && Math.random() < 1 / 60) {
            this.attackDelay = 0;
            this.attack();
        }
    }

    private attack() {
        this.state = MovementStates.ATTACKING;
        this.animator.fps = 1.5;
        // this.animator.fps = 1;
        this.animator.play("curious", {
            onComplete: () => {
                this.animator.fps = 4;
                this.state = MovementStates.FLOATING;
            },
        } );

        // for (let i = 0; i < 5; i ++) {
        //     let flame = new WilloFlame(480, this.world, 5, 120, new PIXI.Point(this.horizontalCenter, this.verticalCenter - 10), 5, Math.PI * 2 / 5 * i, 30 * i, 150);
        //     this.world.particleSystem.add(flame);
        // }

        let flame = new WilloFlame(480, this.world, Math.floor(Math.random() * 4 + 3), 40, new PIXI.Point(this.horizontalCenter, this.verticalCenter - 10), 5);
        this.world.particleSystem.add(flame);
    }

}
