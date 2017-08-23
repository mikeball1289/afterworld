import Map from "../world/Map";
import World from "../world/World";
import PassiveGhost, { MovementStates } from "./PassiveGhost";
import Player from "./Player";

const VIEW_RANGE_X = 150;
const VIEW_RANGE_Y = 50;
const ATTACK_DASH_SPEED = 5;
const ATTACK_TOTAL_TIME = 75;
const ATTACK_COOLDOWN_TIME = 75;

export default class Ghost extends PassiveGhost {

    private attackTimer = 0;
    private attackCooldown = 0;
    private hasHitPlayer = false;
    private _attacking = false;
    get attacking() {
        return this._attacking;
    }

    set attacking(val) {
        if (!val && this._attacking) {
            this.animator.play("idle", { override: true, loop: true } );
            this.attackCooldown = 0;
        } else if (val && !this._attacking) {
            this.attackTimer = 0;
            this.hasHitPlayer = false;
        }
        this._attacking = val;
    }

    constructor(world: World) {
        super(world, "/images/ghost_hostile_sheet.png");
    }

    public updateImpulse(map: Map, player?: Player) {
        if (this.state === MovementStates.DEAD) return;
        if (!this.attacking) {
            super.updateImpulse(map, player);
            this.attackCooldown ++;
            if (player) {
                if (this.attackCooldown > ATTACK_COOLDOWN_TIME && Math.random() < 1 / 100 &&
                    this.right + VIEW_RANGE_X > player.left && this.left - VIEW_RANGE_X < player.right &&
                    this.bottom + VIEW_RANGE_Y > player.top && this.top - VIEW_RANGE_Y < player.bottom)
                {
                    this.attacking = true;
                    if (player.horizontalCenter < this.horizontalCenter) this.direction = -1;
                    else this.direction = 1;
                    this.animator.play("beginAttack", {
                        onComplete: () => {
                            this.animator.play("attack", { loop: true } );
                        },
                    } );
                }
            }
        } else {
            this.attackTimer ++;
            if (this.animator.animationName === "beginAttack") {
                this.velocity.x = this.direction * this.animator.progress * this.animator.progress * ATTACK_DASH_SPEED;
            } else {
                this.velocity.x = this.direction * ATTACK_DASH_SPEED;
            }
            if (this.attackTimer > 15 && !this.hasHitPlayer && player && this.hitTest(player)) {
                player.applyDamage(Math.floor(Math.random() * 2 + 1), new PIXI.Point(3 * this.direction, -2));
                this.hasHitPlayer = true;
            }
            this.velocity.y = 0;
            if (this.attackTimer > ATTACK_TOTAL_TIME) {
                this.attacking = false;
                this.state = MovementStates.WALKING;
            }
        }
    }

    public handleCollisions(collisions: [boolean, boolean]) {
        if (this.attacking && collisions[0]) {
            this.attacking = false;
        }
        super.handleCollisions(collisions);
    }

    public get collideable() {
        return !this.attacking;
    }
}
