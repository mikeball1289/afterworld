import Animator from "../display/Animator";
import DebrisParticle from "../particlesystem/DebrisParticle";
import { soundManager } from "../root";
import Map from "../world/Map";
import { EPSILON, GRAVITY } from "../world/physicalConstants";
import World from "../world/World";
import Enemy from "./Enemy";
import Player from "./Player";

enum MovementStates {
    IDLE,
    WALKING,
    CHASING,
    ATTACKING,
    DEAD,
}

const WALK_IMPULSE = 0.1;
const IDLE_GROUNDED_DECAY = 0.85;
const HORIZONTAL_THRESHOLD = 0.4;
const FULL_HORIZONTAL_DECAY = 0.88;

const MAX_HEALTH = 10;
const VIEW_DISTANCE = 400;

export default class Skelly extends Enemy {
    public weight = 1.8;
    public maxHealth = MAX_HEALTH;
    public animator: Animator<{
        idle: [number, number];
        walk: [number, number];
        attack: [number, number];
        die: [number, number];
    }>;

    private _state = MovementStates.IDLE;

    private noticePlayerTimer: number = 1;
    private goingUp: boolean = false;
    private attackCooldown = 0;

    set state(val: MovementStates) {
        this._state = val;
        if (val !== MovementStates.CHASING) this.noticePlayerTimer = 1;
    }

    get state() {
        return this._state;
    }

    get collideable() {
        return this.state !== MovementStates.DEAD;
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

        this.health = MAX_HEALTH;
        this.direction = Math.random() < 0.5 ? -1 : 1;
    }

    public walk() {
        this.velocity.x += WALK_IMPULSE * this.direction;
        if (Math.abs(this.velocity.x) > HORIZONTAL_THRESHOLD) this.velocity.x *= FULL_HORIZONTAL_DECAY;
        this.animator.play("walk", { loop: true });
    }

    public stand() {
        this.velocity.x *= IDLE_GROUNDED_DECAY;
        if (Math.abs(this.velocity.x) < EPSILON) this.velocity.x = 0;
        this.animator.play("idle", { loop: true });
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
                this.healthBar.alpha = 1 - (frame / 7);

                if (frame === 6) {
                    soundManager.playSound("/sounds/skelly_rattle.ogg");
                    for (let i = 0; i < 6; i ++) {
                        let particle = new DebrisParticle(PIXI.loader.resources["/images/bone_particle.png"].texture, this.world);
                        particle.x = this.horizontalCenter;
                        particle.y = this.top + this.size.y / 2;
                        let overkill = Math.min(damage / MAX_HEALTH, 1);
                        particle.velocity.x = ((Math.random() - 0.5) * 5 + Math.min(10, Math.max(-10, knockback.x)) / 2) * (overkill / 2 + 1);
                        particle.velocity.y = (Math.random() * -4 - 1) - (overkill * 15) + knockback.y / 2 * (overkill / 2 + 1);
                        particle.rotationVelocity = Math.random() * 2 - 1;
                        this.world.particleSystem.add(particle);
                    }
                }
            },
        } );
        this.animator.fps = 8;
        this.state = MovementStates.DEAD;
    }

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        super.destroy(options);
    }

    public updateImpulse(map: Map, player?: Player): void {
        if (this.state === MovementStates.DEAD) return;
        if (!map.isGrounded(this)) {
            this.velocity.y += GRAVITY;
            return;
        }

        if (this.state !== MovementStates.CHASING && this.state !== MovementStates.ATTACKING) {
            if (player && player.right > this.left - VIEW_DISTANCE && player.right < this.right + VIEW_DISTANCE && this.top < player.bottom && this.bottom > player.top) {
                if (Math.random() < this.noticePlayerTimer / 500) {
                    this.state = MovementStates.CHASING;
                } else {
                    this.noticePlayerTimer ++;
                }
            }
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown --;
        }

        if (this.buffs.hasCondition("stunned")) {
            if (this.state === MovementStates.ATTACKING) {
                this.state = MovementStates.CHASING;
            }
            this.idleUpdate(map, player);
        } else if (this.state === MovementStates.IDLE || this.buffs.hasCondition("stunned")) {
            this.idleUpdate(map, player);
        } else if (this.state === MovementStates.WALKING) {
            this.walkingUpdate(map, player);
        } else if (this.state === MovementStates.ATTACKING) {
            this.attackingUpdate(map, player);
        } else if (this.state === MovementStates.CHASING) {
            this.chasingUpdate(map, player);
        }
    }

    private attackingUpdate(map: Map, player?: Player) {
        this.velocity.x *= IDLE_GROUNDED_DECAY;
        if (Math.abs(this.velocity.x) < EPSILON) this.velocity.x = 0;
    }

    private idleUpdate(map: Map, player?: Player) {
        this.stand();
        if (Math.random() < 1 / 300) {
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

    private chasingUpdate(map: Map, player?: Player) {
        if (!player) {
            this.state = MovementStates.WALKING;
            return this.updateImpulse(map, player);
        }

        if (player.right < this.left - 5 || player.left > this.right + 5) {
            this.walk();
        } else {
            this.stand();
        }

        if (Math.random() < 1 / 30) {
            if (player.horizontalCenter < this.horizontalCenter) {
                this.direction = -1;
            } else {
                this.direction = 1;
            }
        }

        if (player &&
            !(player.right > this.left - VIEW_DISTANCE * 2 &&
            player.right < this.right + VIEW_DISTANCE * 2 &&
            this.top < player.bottom + 200 &&
            this.bottom > player.top - 200))
        {
            this.state = MovementStates.WALKING;
        }

        if (!this.isFearless(map)) {
            if (this.direction < 0 && !Map.isWalkable(map.getPixelData(this.left, this.bottom))) {
                this.direction = 1;
                this.state = MovementStates.WALKING;
            } else if (this.direction > 0 && !Map.isWalkable(map.getPixelData(this.right, this.bottom))) {
                this.direction = -1;
                this.state = MovementStates.WALKING;
            }
        }

        if ((this.direction < 0 && player.bottom < this.bottom && Map.isWalkable(map.getPixelData(this.left, this.bottom - 2 - EPSILON)))  ||
            (this.direction > 0 && player.bottom < this.bottom && Map.isWalkable(map.getPixelData(this.right - EPSILON, this.bottom - 2 - EPSILON))))
        {
            this.y -= 2;
        }

        if (this.attackCooldown <= 0 && Math.abs(this.bottom - player.bottom) < this.size.y && Math.abs(this.horizontalCenter - player.horizontalCenter) < this.size.x + 10 && Math.random() < 1 / 30) {
            if (this.horizontalCenter < player.horizontalCenter) {
                this.direction = 1;
            } else {
                this.direction = -1;
            }
            this.state = MovementStates.ATTACKING;
            this.animator.play("attack", {
                onProgress: (frame) => {
                    if (frame === 3) {
                        soundManager.playSound("/sounds/skelly_scratch.ogg", 1, "scratch");
                        player.applyDamage( { amount: Math.floor(Math.random() * 2 + 1), type: "physical" }, new PIXI.Point());
                    }
                },
                onComplete: () => {
                    this.state = MovementStates.CHASING;
                    this.attackCooldown = 120;
                },
            } );
        }
    }

}
