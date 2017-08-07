import attackFunctions from "../attacks/attackFunctions";
import ColorTweener from "../ColorTweener";
import PlayerStats from "../combat/PlayerStats";
import Animator, { IAnimatorOptions } from "../display/Animator";
import HealthBar from "../display/HealthBar";
import DamageParticle from "../particlesystem/DamageParticle";
import FireParticle from "../particlesystem/FireParticle";
import { hasInput, InputType, juggler } from "../root";
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
};

const BASIC_ATTACKS: ["attack1", "attack2"] = ["attack1", "attack2"];

export default class PlayerCharacter extends Actor {
    public healthBar: HealthBar;

    private jumpBuffer: boolean = true;
    private interactBuffer: boolean = true;
    private locked: boolean = false;
    private attackCooldown: number = 0;
    private sprite: PIXI.Sprite;
    private tintTimer = 0;

    private body: {
        arm: Animator<PlayerAnimations>;
        head: Animator<PlayerAnimations>;
        body: Animator<PlayerAnimations>;
        weapon: Animator<PlayerAnimations>;
    };
    private stats: PlayerStats;

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
        this.stats = new PlayerStats();
        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);
        let frameData: PlayerAnimations = {
                walk: [0, 4],
                idle: [1, 1],
                jump: [2, 1],
                attack1: [3, 4],
                attack2: [4, 4],
            };
        this.body = {
            arm: new Animator(PIXI.loader.resources["/sprites/arm_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/arm_base.json"].data), frameData, "idle", 6),
            weapon: new Animator(PIXI.loader.resources["/sprites/weapon_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/weapon_base.json"].data), frameData, "idle", 6),
            head: new Animator(PIXI.loader.resources["/sprites/head_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/head_base.json"].data), frameData, "idle", 6),
            body: new Animator(PIXI.loader.resources["/sprites/body_base.png"].texture, JSON.parse(PIXI.loader.resources["/sprites/body_base.json"].data), frameData, "idle", 6),
        };
        this.sprite.addChild(this.body.body);
        this.sprite.addChild(this.body.head);
        this.sprite.addChild(this.body.weapon);
        this.sprite.addChild(this.body.arm);
        this.body.body.anchor.set(0.5, 1);
        this.body.head.anchor.set(0.5, 1);
        this.body.weapon.anchor.set(0.5, 1);
        this.body.arm.anchor.set(0.5, 1);
        this.size.x = 32;
        this.size.y = 80;
        this.sprite.x = this.size.x / 2;
        this.sprite.y = this.size.y;

        this.healthBar = new HealthBar(50, 0x00FF5D);
        world.uiManager.worldLayers[0].addChild(this.healthBar);

        // let addFireParticle = () => {
        //     let startTweener = new ColorTweener(0xFFFFFF, 0xFFF191);
        //     let endTweener = new ColorTweener(0xFFF191, 0xD60000);
        //     for (let i = 0; i < 400; i ++) {
        //         let randomDirection = Math.random() * Math.PI * 2;
        //         let speed = (Math.random() + Math.floor(i / 100)) * 0.4 + 0.1;
        //         speed *= Math.abs(speed);
        //         let particle = new FireParticle((100 - (speed * speed * 6) - Math.random() * (40 - speed * 20)) / 2,
        //                                         new ColorTweener(startTweener.getInbetween(speed / 2.89), endTweener.getInbetween(speed / 2.89)));
        //         let radialX = speed * Math.sin(randomDirection);
        //         let radialY = speed * Math.cos(randomDirection);
        //         particle.velocity.x = radialX * 2 + this.velocity.x * 0.3;
        //         particle.velocity.y = radialY * 2 + this.velocity.y * 0.3;
        //         particle.x = this.horizontalCenter + radialX * 15;
        //         particle.y = this.verticalCenter + radialY * 15;
        //         this.world.particleSystem.add(particle);
        //     }
        //     juggler.afterFrames(180, addFireParticle);
        // };

        // juggler.afterFrames(180, addFireParticle);
    }

    public play(animation: keyof PlayerAnimations, options?: IAnimatorOptions) {
        if (this.locked) return;
        let partialOptions = {
            loop: options && options.loop,
            override: options && options.override,
        };
        this.body.body.play(animation, options);
        this.body.head.play(animation, partialOptions);
        this.body.weapon.play(animation, partialOptions);
        this.body.arm.play(animation, partialOptions);
    }

    // do the animations and setup triggers for basic attack
    public performBasicAttack() {
        let randomAttack = BASIC_ATTACKS[Math.floor(Math.random() * 2)];
        this.play(randomAttack, {
            onProgress: (frame) => {
                if (frame === 2) {
                    attackFunctions.basicAttack(this, this.world);
                }
            },
            onComplete: () => {
                this.locked = false;
                this.attackCooldown = 20;
            },
        } );
        this.locked = true;
    }

    public updateImpulse(map: Map, getControls = true) {
        let grounded = map.isGrounded(this);
        getControls = getControls && !this.locked;

        if (getControls && hasInput(InputType.PRIMARY_ATTACK) && this.attackCooldown <= 0) {
            this.performBasicAttack();
            getControls = getControls && !this.locked;
        }

        if (grounded) {
            if (getControls && hasInput(InputType.LEFT)) {
                this.velocity.x -= PC.WALK_IMPULSE;
                this.direction = -1;
                this.play("walk", { loop: true });
            } else if (getControls && hasInput(InputType.RIGHT)) {
                this.velocity.x += PC.WALK_IMPULSE;
                this.direction = 1;
                this.play("walk", { loop: true });
            } else {
                this.velocity.x *= PC.IDLE_GROUNDED_DECAY;
                if (Math.abs(this.velocity.x) < PC.EPSILON) this.velocity.x = 0;
                this.play("idle", { loop: true });
            }
            if (Math.abs(this.velocity.x) > PC.HORIZONTAL_THRESHOLD) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
            if (getControls && hasInput(InputType.JUMP) && this.jumpBuffer) {
                if (getControls && hasInput(InputType.DOWN)) {
                    if (!Map.testLine({ x: this.left, y: this.bottom }, { x: this.right - PC.EPSILON, y: this.bottom },
                            (x, y) => !Map.isDroppable(map.getPixelData(x, y)), 2))
                    {
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
            this.play("jump", { loop: true });
            this.velocity.y += PC.GRAVITY;
            if (Math.abs(this.velocity.y) > PC.TERMINAL_VELOCITY) this.velocity.y *= PC.AERIAL_DRAG;
            if (getControls && hasInput(InputType.LEFT)) {
                if (this.velocity.x > 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x > -PC.HORIZONTAL_THRESHOLD) this.velocity.x -= PC.AERIAL_IMPULSE;
            } else if (getControls && hasInput(InputType.RIGHT)) {
                if (this.velocity.x < 0) this.velocity.x = this.velocity.x * PC.FULL_HORIZONTAL_DECAY;
                if (this.velocity.x < PC.HORIZONTAL_THRESHOLD) this.velocity.x += PC.AERIAL_IMPULSE;
            } else {
                if (Math.abs(this.velocity.x) > PC.FULL_HORIZONTAL_DECAY / (1 - PC.FULL_HORIZONTAL_DECAY) * PC.WALK_IMPULSE) this.velocity.x *= PC.FULL_HORIZONTAL_DECAY;
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
        } else {
            // dont come out of a control lock immediately jumping
            this.jumpBuffer = false;
        }
    }

    public isDead() {
        return this.stats.health <= 0;
    }

    public die() {
        // pass
    }

    public tintAll(tint: number = 0xFFFFFF) {
        this.body.arm.tint = tint;
        this.body.body.tint = tint;
        this.body.head.tint = tint;
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
