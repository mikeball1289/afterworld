import Animator from "../display/Animator";
import DamageParticle from "../particlesystem/DamageParticle";
import { soundManager } from "../root";
import { ICombatObject } from "./ActorInterfaces";
import NonPlayerActor from "./NonPlayerActor";

const smacks = ["/sounds/hit_smack1.ogg", "/sounds/hit_smack1.ogg"];

abstract class Enemy extends NonPlayerActor implements ICombatObject {

    public static isEnemy(obj: any): obj is Enemy {
        return obj && obj.isAnEnemy;
    }

    public health: number = 0;
    public animator: Animator<{ die: [number, number] }>;
    private isAnEnemy = true;

    public abstract isDead(): boolean;
    public abstract die(damage: number, knockback: PIXI.Point): void;

    public applyAttack(damage: IDamageBundle, knockback: PIXI.Point) {
        if (this.isDead()) return false;

        soundManager.playSound(smacks[Math.floor(Math.random() * smacks.length)], 1, "smack_hit");

        let particle = new DamageParticle(damage.amount, "enemyDamage", this);
        this.world.particleSystem.add(particle, false);
        this.world.uiManager.worldLayers[1].addChild(particle);

        this.health -= damage.amount;
        if (this.health <= 0) {
            this.die(damage.amount, knockback);
        } else {
            this.applyImpulse(knockback.x, knockback.y);
        }
        return true;
    }
}

export default Enemy;
