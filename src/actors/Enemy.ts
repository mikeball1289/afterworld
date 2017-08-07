import DamageParticle from "../particlesystem/DamageParticle";
import { ICombatObject } from "./ActorInterfaces";
import NonPlayerActor from "./NonPlayerActor";

abstract class Enemy extends NonPlayerActor implements ICombatObject {
    public health: number = 0;
    public abstract isDead(): boolean;
    public abstract die(damage: number, knockback: PIXI.Point): void;
    public applyAttack(damage: number, knockback: PIXI.Point) {
        if (this.isDead()) return false;

        let particle = new DamageParticle(damage, "enemyDamage", this);
        this.world.particleSystem.add(particle, false);
        this.world.uiManager.worldLayers[1].addChild(particle);

        this.health -= damage;
        if (this.health <= 0) {
            this.die(damage, knockback);
        } else {
            this.applyImpulse(knockback.x, knockback.y);
        }
        return true;
    }
}

export default Enemy;
