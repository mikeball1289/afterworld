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
    ATTACKING,
}

const WALK_IMPULSE = 0.1;
const IDLE_GROUNDED_DECAY = 0.85;
const HORIZONTAL_THRESHOLD = 0.4;
const FULL_HORIZONTAL_DECAY = 0.88;

const VIEW_DISTANCE = 400;

export default class Skelly extends NonPlayerActor {

    private animator: Animator<{
        idle: [number, number];
        walk: [number, number];
        attack: [number, number];
        die: [number, number];
    }>;

    private _state = MovementStates.IDLE;
    private _direction: -1 | 1 = 1;
    public weight = 1.8;

    set state(val: MovementStates) {
        this._state = val;
        if (val !== MovementStates.CHASING) this.noticePlayerTimer = 1;
    }

    get state() {
        return this._state;
    }

    set direction(val: -1 | 1) {
        if (this._direction !== val) {
            // this.animator.setProgress(0);
            this._direction = val;
            this.animator.scale.x = 1.5 * val;
        }
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

    private noticePlayerTimer: number = 1;
    private goingUp: boolean = false;
    private attackCooldown = 0;

    walk() {
        this.velocity.x += WALK_IMPULSE * this.direction;
        if (Math.abs(this.velocity.x) > HORIZONTAL_THRESHOLD) this.velocity.x *= FULL_HORIZONTAL_DECAY;
        this.animator.play("walk", { loop: true });
    }

    stand() {
        this.velocity.x *= IDLE_GROUNDED_DECAY;
        if (Math.abs(this.velocity.x) < EPSILON) this.velocity.x = 0;
        this.animator.play("idle", { loop: true });
    }

    isFearless(map: Map) {
        return Map.isFearless(map.getPixelData(this.left, this.bottom + EPSILON)) || Map.isFearless(map.getPixelData(this.right, this.bottom + EPSILON));
    }

    updateImpulse(map: Map, player?: PlayerCharacter): void {
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

        switch(this.state) {
            case MovementStates.IDLE: {
                this.idleUpdate(map, player);
                break;
            }
            case MovementStates.WALKING: {
                this.walkingUpdate(map, player);
                break;
            }
            case MovementStates.CHASING: {
                this.chasingUpdate(map, player);
                break;
            }
            case MovementStates.ATTACKING: {
                this.attackingUpdate(map, player);
                break;
            }
        }
    }

    attackingUpdate(map: Map, player?: PlayerCharacter) {
        this.velocity.x *= IDLE_GROUNDED_DECAY;
        if (Math.abs(this.velocity.x) < EPSILON) this.velocity.x = 0;
    }

    idleUpdate(map: Map, player?: PlayerCharacter) {
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

    walkingUpdate(map: Map, player?: PlayerCharacter) {
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

    chasingUpdate(map: Map, player?: PlayerCharacter) {
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
                        console.log("attack hit");
                    }
                },
                onComplete: () => {
                    this.state = MovementStates.CHASING;
                    this.attackCooldown = 120;
                }
            } );
        }
    }

    handleCollisions(collisions: [boolean, boolean]) {
        if (collisions[0]) {
            this.velocity.x = 0;
            if (this.state === MovementStates.WALKING) this.direction *= -1;
        }
        if (collisions[1]) this.velocity.y = 0;
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        super.destroy(options);
        this.world = <any> undefined;
    }
}