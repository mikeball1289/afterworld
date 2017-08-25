import ColorTweener from "../ColorTweener";
import Inventory, { IEquipmentSlots } from "../data/Inventory";
import PlayerStats from "../data/PlayerStats";
import SkillBar from "../data/Skillbar";
import * as skillData from "../data/skillData";
import * as skillFunctions from "../data/skillFunctions";
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
    offhand_front: Animator<PlayerAnimations>;
    offhand_back: Animator<PlayerAnimations>;
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

const BODY_ANIMATION_KEYS: (keyof IBodyAnimations)[] = ["offhand_back", "back_hand", "offhand_front", "feet", "legs", "body", "head", "weapon", "front_hand", "front_arm"];

export default class Player extends Actor {
    public static isPlayer(obj: any): obj is Player {
        return obj && obj.isPlayer;
    }

    public healthBar: HealthBar;
    public attacking: boolean = false;
    public inventory: Inventory;
    public body: IBodyAnimations;

    public stats: PlayerStats;
    public skillBar: SkillBar;

    private jumpBuffer: boolean = true;
    private sprite: PIXI.Sprite;
    private deathFrame: PIXI.Sprite;
    private controlLocks: boolean[] = [];

    private _direction: 1 | -1 = 1;
    set direction(val: 1 | -1) {
        this._direction = val;
        this.sprite.scale.x = val;
    }
    get direction() {
        return this._direction;
    }

    private isPlayer = true;

    constructor(world: World) {
        super(world);
        this.inventory = new Inventory(world);
        this.stats = new PlayerStats(this, world);
        this.skillBar = new SkillBar(this, world);
        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);
        let frameData: PlayerAnimations = {
            walk: [0, 4],
            idle: [1, 1],
            jump: [2, 1],
            attack1: [3, 4],
            attack2: [4, 4],
            cast: [5, 4],
        };
        this.body = {
            front_arm: new Animator(undefined, undefined, frameData, "idle", 6),
            weapon: new Animator(undefined, undefined, frameData, "idle", 6),
            head: new Animator(undefined, undefined, frameData, "idle", 6),
            body: new Animator(undefined, undefined, frameData, "idle", 6),
            legs: new Animator(undefined, undefined, frameData, "idle", 6),
            feet: new Animator(undefined, undefined, frameData, "idle", 6),
            front_hand: new Animator(undefined, undefined, frameData, "idle", 6),
            back_hand: new Animator(undefined, undefined, frameData, "idle", 6),
            offhand_back: new Animator(undefined, undefined, frameData, "idle", 6),
            offhand_front: new Animator(undefined, undefined, frameData, "idle", 6),
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

        this.loadEquipment();
    }

    public loadEquipment() {
        for (let slot of Keys(this.inventory.equipment)) {
            let equip = this.inventory.equipment[slot];
            if (equip) {
                equip.addEquipmentGraphic(this);
            } else {
                this.unsetEquipmentGraphic(slot);
            }
        }
    }

    public unsetEquipmentGraphic(slot: keyof IEquipmentSlots) {
        switch (slot) {
            case "head": {
                this.body.head.loadTexturePackerFrames("/sprites/head_base.png", "/sprites/head_base.json");
                break;
            }
            case "body": {
                this.body.body.loadTexturePackerFrames("/sprites/body_base.png", "/sprites/body_base.json");
                this.body.front_arm.loadTexturePackerFrames("/sprites/front_arm_base.png", "/sprites/front_arm_base.json");
                break;
            }
            case "legs": {
                this.body.legs.loadTexturePackerFrames("/sprites/legs_base.png", "/sprites/legs_base.json");
                break;
            }
            case "feet": {
                this.body.feet.loadTexturePackerFrames("/sprites/feet_base.png", "/sprites/feet_base.json");
                break;
            }
            case "weapon": {
                this.body.weapon.loadTexturePackerFrames("/sprites/weapon_base.png", "/sprites/weapon_base.json");
                break;
            }
            case "gloves": {
                this.body.front_hand.loadTexturePackerFrames("/sprites/front_hand_base.png", "/sprites/front_hand_base.json");
                this.body.back_hand.loadTexturePackerFrames("/sprites/back_hand_base.png", "/sprites/back_hand_base.json");
                break;
            }
            case "offhand": {
                this.body.offhand_back.loadTexturePackerFrames("/sprites/offhand_back_base.png", "/sprites/offhand_back_base.json");
                this.body.offhand_front.loadTexturePackerFrames("/sprites/offhand_front_base.png", "/sprites/offhand_front_base.json");
            }
            default: break;
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

        if (this.hasUseableInput(InputType.PRIMARY_ATTACK, getControls)) this.skillBar.useSkill(0);
        if (this.hasUseableInput(InputType.SECONDARY_ATTACK, getControls)) this.skillBar.useSkill(1);
        if (this.hasUseableInput(InputType.ABILITY_1, getControls)) this.skillBar.useSkill(2);
        if (this.hasUseableInput(InputType.ABILITY_2, getControls)) this.skillBar.useSkill(3);
        if (this.hasUseableInput(InputType.ABILITY_3, getControls)) this.skillBar.useSkill(4);
        if (this.hasUseableInput(InputType.ABILITY_4, getControls)) this.skillBar.useSkill(5);
        getControls = getControls && !this.attacking;

        if (grounded) {
            if (this.hasUseableInput(InputType.LEFT, getControls)) {
                this.velocity.x -= this.stats.walkSpeed;
                this.direction = -1;
                this.play("walk", { loop: true });
            } else if (this.hasUseableInput(InputType.RIGHT, getControls)) {
                this.velocity.x += this.stats.walkSpeed;
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
                    this.velocity.y = -this.stats.jumpPower;
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
                this.direction = -1;
                if (this.velocity.x > 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x > -PC.HORIZONTAL_THRESHOLD) this.velocity.x -= PC.AERIAL_IMPULSE;
            } else if (this.hasUseableInput(InputType.RIGHT, getControls)) {
                this.direction = 1;
                if (this.velocity.x < 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x < PC.HORIZONTAL_THRESHOLD) this.velocity.x += PC.AERIAL_IMPULSE;
            } else {
                if (Math.abs(this.velocity.x) > PC.FULL_HORIZONTAL_DECAY / (1 - PC.FULL_HORIZONTAL_DECAY) * this.stats.walkSpeed) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
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
        this.stats.setHealth(Math.ceil(this.stats.maxHealth * healthPercent), true);
        this.stats.energy = this.stats.maxEnergy;
        this.removeChild(this.deathFrame);
        this.addChild(this.sprite);
        this.sprite.scale.x = this.direction;
    }

    public tintAll(tint: number = 0xFFFFFF) {
        for (let key of BODY_ANIMATION_KEYS) {
            this.body[key].tints.addTint(tint);
        }
    }

    public untintAll(tint?: number) {
        for (let key of BODY_ANIMATION_KEYS) {
            if (tint === undefined) {
                this.body[key].tints.reset();
            } else {
                this.body[key].tints.removeTint(tint);
            }
        }
    }

    public get collideable() {
        return !this.isDead();
    }

    public applyDamage(damage: IDamageBundle, knockback: PIXI.Point) {
        if (this.isDead()) return false;

        let { damage: d, knockback: k } = this.buffs.process("takeDamage", { damage, knockback } );
        damage = d;
        knockback = k;
        let particle = new DamageParticle(damage.amount, "playerDamage", this);
        this.world.particleSystem.add(particle, false);
        this.world.uiManager.worldLayers[1].addChild(particle);

        this.stats.health -= damage.amount;
        if (this.stats.health <= 0) {
            this.die();
        } else {
            this.applyImpulse(knockback.x, knockback.y);
            this.tintAll(0xFFCCCC);
            juggler.afterFrames(10, () => this.untintAll(0xFFCCCC));
        }
        return true;
    }

    public frameUpdate() {
        super.frameUpdate();

        this.skillBar.update();
        this.stats.update();

        if (this.fallthrough && Math.abs(this.y - this.fallthrough) >= 5) {
            this.fallthrough = undefined;
        }

        this.healthBar.x = this.horizontalCenter;
        this.healthBar.y = this.top - 40;
        this.healthBar.setAmount(this.stats.health / this.stats.maxHealth);
        this.world.uiManager.playerHud.setHP(this.stats.health, this.stats.maxHealth);
        this.world.uiManager.playerHud.setEP(this.stats.energy, this.stats.maxEnergy);
    }

    public handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) this.velocity.x = 0;
        if (collisions[1]) this.velocity.y = 0;
    }
}
