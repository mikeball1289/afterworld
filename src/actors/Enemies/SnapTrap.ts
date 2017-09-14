import {Animator} from "../../display/Animator";
import {fromTextureCache} from "../../pixiTools";
import {Map} from "../../world/Map";
import {EPSILON, GRAVITY} from "../../world/physicalConstants";
import {World} from "../../world/World";
import {Enemy} from "../Enemy";
import {Player} from "../Player";

const MAX_HEALTH = 15;

export class SnapTrap extends Enemy {
    public static PRETTY_NAME = "Snap Trap";

    public enemyName = SnapTrap.PRETTY_NAME;

    public animator: Animator<{idle: NN, attack: NN, die: NN}>;
    public maxHealth = MAX_HEALTH;
    private attackTimer = 0;
    private attacking = false;

    constructor(world: World) {
        super(world);
        this.size = new PIXI.Point(34, 60);
        this.animator = new Animator(fromTextureCache("/images/snaptrap_sheet.png"), new PIXI.Point(48, 48), {
            idle: [0, 4],
            attack: [1, 5],
            die: [2, 1],
        }, "idle", 6);
        this.animator.pivot.set(this.size.x / 2, this.size.y / 1.5);
        this.animator.scale.set(1.5);
        this.animator.x = this.size.x / 2;
        this.animator.y = this.size.y;
        this.addChild(this.animator);
        this.health = MAX_HEALTH;
        this.direction = Math.random() < 0.5 ? -1 : 1;
    }

    public isDead(): boolean {
        return this.health <= 0;
    }

    public die(damage: number, knockback: PIXI.Point): void {
        this.animator.play("die", { loop: true, override: true });
    }

    get collideable() {
        return false;
    }

    public frameUpdate() {
        super.frameUpdate();
        if (this.isDead()) {
            this.animator.scale.set(this.animator.scale.y - 0.02);
            this.animator.scale.x *= this.direction;
            this.healthBar.alpha = this.animator.scale.y;
            if (this.animator.scale.y <= 0) {
                this.world.actorManager.removeEnemy(this);
                this.destroy();
            }
        }
    }

    public updateImpulse(map: Map, player?: Player | undefined): void {
        this.velocity.set(0);
        if (this.attacking || this.isDead() || this.buffs.hasCondition("stunned")) return;
        if (Math.random() < 1 / 300) {
            this.direction *= -1;
        }
        if (this.attackTimer > 0) {
            this.attackTimer --;
        }
        if (player && this.attackTimer <= 0 && Math.random() < 1 / 200 && player.hitTest(new PIXI.Rectangle(this.left - 25, this.top, this.size.x + 50, this.size.y))) {
            if (player.horizontalCenter < this.horizontalCenter) this.direction = -1;
            else this.direction = 1;
            this.attackTimer = 60;
            this.animator.play("attack", {
                onProgress: (frame) => {
                    if (frame !== 2) return;
                    player.applyDamage({ amount: Math.floor(Math.random() * 3 + 2), type: "physical" }, new PIXI.Point());
                },
            } );
        }
    }

}
