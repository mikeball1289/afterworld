import { hasInput, InputType, juggler } from "../root";
import World from "../world/World";
import Map from "../world/Map";
import Actor from "./Actor";
import * as PC from "../world/physicalConstants";
import Animator, { AnimatorOptions } from "../display/Animator";
import NonPlayerActor from "./NonPlayerActor";

type PlayerAnimations = {
    idle: [number, number];
    walk: [number, number];
    jump: [number, number];
    attack1: [number, number];
    attack2: [number, number];
}

const BASIC_ATTACKS: ["attack1", "attack2"] = ["attack1", "attack2"];

export default class PlayerCharacter extends Actor {

    private sprite: PIXI.Sprite;
    private body: {
        arm: Animator<PlayerAnimations>;
        head: Animator<PlayerAnimations>;
        body: Animator<PlayerAnimations>;
        weapon: Animator<PlayerAnimations>;
    };

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
        }
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
    }

    play(animation: keyof PlayerAnimations, options?: AnimatorOptions) {
        if (this.locked) return;
        let partialOptions = {
            loop: options && options.loop,
            override: options && options.override,
        }
        this.body.body.play(animation, options);
        this.body.head.play(animation, partialOptions);
        this.body.weapon.play(animation, partialOptions);
        this.body.arm.play(animation, partialOptions);
    }

    jumpBuffer: boolean = true;
    interactBuffer: boolean = true;
    locked: boolean = false
    attackCooldown: number = 0;

    updateImpulse(map: Map, getControls = true) {
        let grounded = map.isGrounded(this);
        getControls = getControls && !this.locked;

        if (this.fallthrough && Math.abs(this.y - this.fallthrough) >= 5) {
            this.fallthrough = undefined;
        }

        if (getControls && hasInput(InputType.PRIMARY_ATTACK) && this.attackCooldown <= 0) {
            let randomAttack = BASIC_ATTACKS[Math.floor(Math.random() * 2)];
            this.play(randomAttack, {
                onProgress: (frame) => {
                    // if (frame === 2) console.log("do the attacky thing!");
                    if (frame === 2) {
                        let attackBox: PIXI.Rectangle = new PIXI.Rectangle(this.horizontalCenter, this.top + this.size.y / 3, 75, 30);
                        let enemies = this.world.npas;

                        let applyAttack = (enemy: NonPlayerActor): boolean => {
                            // return false;
                            if (enemy.left < attackBox.right && enemy.right > attackBox.left && enemy.top < attackBox.bottom && enemy.bottom > attackBox.top) {
                                // console.log(enemy.id);
                                enemy.applyImpulse(4 * this.direction, 0);
                                return true;
                            }
                            return false;
                        }

                        if (this.direction === -1) {
                            attackBox.x -= 75;
                            for (let i = enemies.length - 1; i >= 0; i --) {
                                if (applyAttack(enemies[i])) break;
                            }
                        } else {
                            for (let i = 0; i < enemies.length; i ++) {
                                if (applyAttack(enemies[i])) break;
                            }
                        }
                    }
                },
                onComplete: () => {
                    this.locked = false;
                    this.attackCooldown = 20;
                }
            } );
            this.locked = true;
        }
        if (this.attackCooldown > 0) {
            this.attackCooldown --;
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
        }
    }

    handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) this.velocity.x = 0;
        if (collisions[1]) this.velocity.y = 0;
    }
}