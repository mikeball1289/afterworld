import ColorTweener from "../ColorTweener";
import attackFunctions from "../data/attackFunctions";
import Inventory, { IEquipmentSlots } from "../data/Inventory";
import PlayerStats from "../data/PlayerStats";
import Animator, { IAnimatorOptions } from "../display/Animator";
import HealthBar from "../display/HealthBar";
import DamageParticle from "../particlesystem/DamageParticle";
import FireParticle from "../particlesystem/FireParticle";
import { controls, InputType, juggler, soundManager } from "../root";
import Map from "../world/Map";
import * as PC from "../world/physicalConstants";
import World from "../world/World";
import Actor from "./Actor";
import Enemy from "./Enemy";

type PlayerAnimations = {
    idle: [number, number];
    walk: [number, number];
    jump: [number, number];
    attack1: [number, number];
    attack2: [number, number];
    cast: [number, number];
};

interface IBodyAnimations {
    front_arm: Animator<PlayerAnimations>;
    head: Animator<PlayerAnimations>;
    body: Animator<PlayerAnimations>;
    weapon: Animator<PlayerAnimations>;
    front_hand: Animator<PlayerAnimations>;
    back_hand: Animator<PlayerAnimations>;
    legs: Animator<PlayerAnimations>;
    feet: Animator<PlayerAnimations>;
}

enum ControlLocks {
    JUMP,
    PRIMARY_ATTACK,
    SECONDARY_ATTACK,
}

let controlLockInputs: InputType[] = [];
controlLockInputs[ControlLocks.JUMP] = InputType.JUMP;
controlLockInputs[ControlLocks.PRIMARY_ATTACK] = InputType.PRIMARY_ATTACK;
controlLockInputs[ControlLocks.SECONDARY_ATTACK] = InputType.SECONDARY_ATTACK;

const BODY_ANIMATION_KEYS: (keyof IBodyAnimations)[] = ["back_hand", "feet", "legs", "body", "head", "weapon", "front_hand", "front_arm"];

export default class Player extends Actor {
    public healthBar: HealthBar;
    public attacking: boolean = false;
    public attackCooldown: number = 0;
    public inventory: Inventory;
    public body: IBodyAnimations;

    public stats: PlayerStats;

    private jumpBuffer: boolean = true;
    private sprite: PIXI.Sprite;
    private deathFrame: PIXI.Sprite;
    private tintTimer = 0;
    private controlLocks: boolean[] = [];

    private _direction: 1 | -1 = 1;
    set direction(val: 1 | -1) {
        this._direction = val;
        this.sprite.scale.x = val;
    }
    get direction() {
        return this._direction;
    }

    constructor(world: World) {
        super(world);
        this.stats = new PlayerStats(this, world);
        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);
        this.inventory = new Inventory(world);
        let frameData: PlayerAnimations = {
            walk: [0, 4],
            idle: [1, 1],
            jump: [2, 1],
            attack1: [3, 4],
            attack2: [4, 4],
            cast: [5, 4],
        };
        this.body = {
            front_arm: new Animator(PIXI.loader.resources["/sprites/front_arm_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/front_arm_base.json"].data), frameData, "idle", 6),
            weapon: new Animator(PIXI.loader.resources["/sprites/weapon_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/weapon_base.json"].data), frameData, "idle", 6),
            head: new Animator(PIXI.loader.resources["/sprites/head_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/head_base.json"].data), frameData, "idle", 6),
            body: new Animator(PIXI.loader.resources["/sprites/body_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/body_base.json"].data), frameData, "idle", 6),
            legs: new Animator(PIXI.loader.resources["/sprites/legs_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/legs_base.json"].data), frameData, "idle", 6),
            feet: new Animator(PIXI.loader.resources["/sprites/feet_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/feet_base.json"].data), frameData, "idle", 6),
            front_hand: new Animator(PIXI.loader.resources["/sprites/front_hand_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/front_hand_base.json"].data), frameData, "idle", 6),
            back_hand: new Animator(PIXI.loader.resources["/sprites/back_hand_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/back_hand_base.json"].data), frameData, "idle", 6),
        };
        for (let key of BODY_ANIMATION_KEYS) {
            this.sprite.addChild(this.body[key]);
            this.body[key].anchor.set(0.5, 1);
        }
        this.size.x = 32;
        this.size.y = 80;
        this.sprite.x = this.size.x / 2;
        this.sprite.y = this.size.y;

        this.healthBar = new HealthBar(50, 0x00FF5D);
        world.uiManager.worldLayers[0].addChild(this.healthBar);

        this.deathFrame = new PIXI.Sprite(PIXI.loader.resources["/images/dark_ghost.png"].texture);
        this.deathFrame.anchor.set(0.5, 1);
        this.deathFrame.x = this.size.x / 2;
        this.deathFrame.y = this.size.y;

        for (let slot of <(keyof IEquipmentSlots)[]> Object.keys(this.inventory.equipment)) {
            let equip = this.inventory.equipment[slot];
            if (equip) {
                equip.addEquipmentGraphic(this);
            }
        }
    }

    public play(animation: keyof PlayerAnimations, options?: IAnimatorOptions) {
        if (this.attacking) return;
        let partialOptions = {
            loop: options && options.loop,
            override: options && options.override,
        };
        for (let key of BODY_ANIMATION_KEYS) {
            if (key === "head") {
                this.body[key].play(animation, options);
            } else {
                this.body[key].play(animation, partialOptions);
            }
        }
    }

    public get fps(): number {
        return this.body.head.fps;
    }

    public set fps(val: number) {
        for (let key of BODY_ANIMATION_KEYS) {
            this.body[key].fps = val;
        }
    }

    public hasUseableInput(input: InputType, getControls: boolean = true): boolean {
        if (!getControls) return false;
        let idx = controlLockInputs.indexOf(input);
        if (idx < 0) {
            return controls.hasInput(input);
        } else {
            return this.controlLocks[idx] && controls.hasInput(input);
        }
    }

    public updateImpulse(map: Map, getControls = true) {
        if (this.isDead() || !getControls) this.controlLocks = [];
        if (this.isDead()) return;

        if (getControls) {
            for (let i = 0; i < controlLockInputs.length; i ++) {
                if (!controls.hasInput(controlLockInputs[i])) {
                    this.controlLocks[i] = true;
                }
            }
        }

        let grounded = map.isGrounded(this);
        getControls = getControls && !this.attacking;

        if (this.attackCooldown <= 0) {
            if (this.hasUseableInput(InputType.PRIMARY_ATTACK, getControls)) {
                if (attackFunctions.basicAttack(this, this.world)) {
                    this.attackCooldown = 55;
                }
            } else if (this.hasUseableInput(InputType.SECONDARY_ATTACK, getControls)) {
                if (attackFunctions.explosion(this, this.world)) {
                    this.attackCooldown = 55;
                }
            } else if (this.hasUseableInput(InputType.ABILITY_1, getControls)) {
                if (attackFunctions.teleport(this, this.world)) {
                    this.attackCooldown = 55;
                }
            } else if (this.hasUseableInput(InputType.ABILITY_2, getControls)) {
                if (attackFunctions.tremor(this, this.world)) {
                    this.attackCooldown = 55;
                }
            } else if (this.hasUseableInput(InputType.ABILITY_3, getControls)) {
                if (attackFunctions.ambush(this, this.world)) {
                    this.attackCooldown = 55;
                }
            } else if (this.hasUseableInput(InputType.ABILITY_4, getControls)) {
                if (attackFunctions.leap(this, this.world)) {
                    this.attackCooldown = 55;
                }
            }
        }
        getControls = getControls && !this.attacking;

        if (grounded) {
            if (this.hasUseableInput(InputType.LEFT, getControls)) {
                this.velocity.x -= this.stats.walkSpeed();
                this.direction = -1;
                this.play("walk", { loop: true });
            } else if (this.hasUseableInput(InputType.RIGHT, getControls)) {
                this.velocity.x += this.stats.walkSpeed();
                this.direction = 1;
                this.play("walk", { loop: true });
            } else {
                this.velocity.x *= PC.IDLE_GROUNDED_DECAY;
                if (Math.abs(this.velocity.x) < PC.EPSILON) this.velocity.x = 0;
                this.play("idle", { loop: true });
            }
            if (Math.abs(this.velocity.x) > PC.HORIZONTAL_THRESHOLD) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
            if (this.hasUseableInput(InputType.JUMP, getControls) && this.jumpBuffer) {
                if (this.hasUseableInput(InputType.DOWN, getControls)) {
                    if (!Map.testLine({ x: this.left, y: this.bottom }, { x: this.right - PC.EPSILON, y: this.bottom },
                            (x, y) => !Map.isDroppable(map.getPixelData(x, y)), 2))
                    {
                        this.jumpBuffer = false;
                        this.fallthrough = this.y;
                        this.velocity.y = -PC.FALLTHROUGH_JUMP_POWER;
                        this.velocity.x = 0;
                        soundManager.playSound("/sounds/jump_pop.ogg", 0.2);
                    }
                } else {
                    this.velocity.y = -this.stats.jumpPower();
                    this.jumpBuffer = false;
                    soundManager.playSound("/sounds/jump_pop.ogg", 0.2);
                }
            } else if (this.hasUseableInput(InputType.UP, getControls)) {
                this.world.attemptMapTransition();
            }

        } else { // we're flying through the sky!
            this.play("jump", { loop: true });
            this.velocity.y += PC.GRAVITY;
            if (Math.abs(this.velocity.y) > PC.TERMINAL_VELOCITY) this.velocity.y *= PC.AERIAL_DRAG;
            if (this.hasUseableInput(InputType.LEFT, getControls)) {
                if (this.velocity.x > 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x > -PC.HORIZONTAL_THRESHOLD) this.velocity.x -= PC.AERIAL_IMPULSE;
            } else if (this.hasUseableInput(InputType.RIGHT, getControls)) {
                if (this.velocity.x < 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x < PC.HORIZONTAL_THRESHOLD) this.velocity.x += PC.AERIAL_IMPULSE;
            } else {
                if (Math.abs(this.velocity.x) > PC.FULL_HORIZONTAL_DECAY / (1 - PC.FULL_HORIZONTAL_DECAY) * this.stats.walkSpeed()) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
                else this.velocity.x *= PC.AERIAL_HORIZONTAL_DECAY;
            }
        }

        if (!controls.hasInput(InputType.JUMP)) {
            this.jumpBuffer = true;
        }

        if (getControls && controls.hasLeadingEdge(InputType.INTERACT)) {
            this.world.attemptInteraction();
        }
    }

    public isDead() {
        return this.stats.health <= 0;
    }

    public die() {
        this.velocity.set(0);
        this.world.dieDialogue();
        this.removeChild(this.sprite);
        this.addChild(this.deathFrame);
        this.deathFrame.scale.x = this.direction;
    }

    public setAlive(healthPercent: number) {
        this.stats.health = Math.ceil(this.stats.maxHealth * healthPercent);
        this.removeChild(this.deathFrame);
        this.addChild(this.sprite);
        this.sprite.scale.x = this.direction;
    }

    public tintAll(tint: number = 0xFFFFFF) {
        for (let key of BODY_ANIMATION_KEYS) {
            this.body[key].tint = tint;
        }
    }

    public get collideable() {
        return !this.isDead();
    }

    public applyDamage(damage: number, knockback: PIXI.Point) {
        if (this.isDead()) return false;

        let particle = new DamageParticle(damage, "playerDamage", this);
        this.world.particleSystem.add(particle, false);
        this.world.uiManager.worldLayers[1].addChild(particle);

        this.stats.health -= damage;
        if (this.stats.health <= 0) {
            this.die();
        } else {
            this.applyImpulse(knockback.x, knockback.y);
            this.tintTimer = 10;
            this.tintAll(0xFFCCCC);
        }
        return true;
    }

    public frameUpdate() {
        super.frameUpdate();

        if (this.attackCooldown > 0) {
            this.attackCooldown --;
        }

        if (this.fallthrough && Math.abs(this.y - this.fallthrough) >= 5) {
            this.fallthrough = undefined;
        }
        if (this.tintTimer > 0) {
            this.tintTimer --;
            if (this.tintTimer <= 0) this.tintAll();
        }

        this.healthBar.x = this.horizontalCenter;
        this.healthBar.y = this.top - 40;
        this.healthBar.setAmount(this.stats.health / this.stats.maxHealth);
    }

    public handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) this.velocity.x = 0;
        if (collisions[1]) this.velocity.y = 0;
    }
}
