import {Animator} from "../display/Animator";
import {HealthBar} from "../display/HealthBar";
import {DamageParticle} from "../particlesystem/DamageParticle";
import {soundManager} from "../root";
import {Map} from "../world/Map";
import {EPSILON} from "../world/physicalConstants";
import {NonPlayerActor} from "./NonPlayerActor";

const smacks = ["/sounds/hit_smack1.ogg", "/sounds/hit_smack1.ogg"];

export abstract class Enemy extends NonPlayerActor {

    public static isEnemy(obj: any): obj is Enemy {
        return obj && obj.isAnEnemy;
    }

    public animator: Animator<{ die: [number, number] }>;
    public abstract maxHealth: number;
    public abstract enemyName: string;
    protected healthBar: HealthBar = new HealthBar();
    private isAnEnemy = true;
    private _direction: -1 | 1 = 1;
    private _health: number = this.maxHealth;

    public abstract isDead(): boolean;
    public abstract die(damage: number, knockback: PIXI.Point): void;

    public get collideable() {
        return !this.isDead();
    }

    set direction(val: -1 | 1) {
        if (this._direction !== val) {
            this._direction = val;
            this.animator.scale.x = Math.abs(this.animator.scale.x) * val;
        }
    }

    get direction() {
        return this._direction;
    }

    set health(val: number) {
        val = Math.max(val, 0);
        this._health = val;
        if (this.healthBar && this.world) {
            this.healthBar.setAmount(this._health / this.maxHealth);
            if (this._health < this.maxHealth) this.world.uiManager.worldLayers[0].addChild(this.healthBar);
        }
        if (this.parent) this.parent.addChild(this);
    }

    get health() {
        return this._health;
    }

    public applyAttack(damage: IDamageBundle, knockback: PIXI.Point = new PIXI.Point()) {
        if (this.isDead()) return false;

        soundManager.playSound(smacks[Math.floor(Math.random() * smacks.length)], 1, "smack_hit");

        let particle = new DamageParticle(damage.amount, "enemyDamage", this, this.world);
        this.world.particleSystem.add(particle, false);
        this.world.uiManager.worldLayers[1].addChild(particle);

        this.health -= damage.amount;
        if (this.health <= 0) {
            this.die(damage.amount, knockback);
            this.world.actorManager.player.buffs.process("killedEnemy", this);
            this.world.emit("enemyDied", this);
        } else {
            this.applyImpulse(knockback.x, knockback.y);
        }
        return true;
    }

    public frameUpdate() {
        super.frameUpdate();
        this.healthBar.x = this.horizontalCenter;
        this.healthBar.y = this.top - 40;
    }

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        super.destroy(options);
        if (this.healthBar.parent) this.healthBar.parent.removeChild(this.healthBar);
        this.healthBar.destroy();
        this.world = <any> undefined;
    }

    public isFearless(map: Map) {
        return Map.isFearless(map.getPixelData(this.left, this.bottom + EPSILON)) || Map.isFearless(map.getPixelData(this.right, this.bottom + EPSILON));
    }
}
