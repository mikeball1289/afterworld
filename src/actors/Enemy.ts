import NonPlayerActor from "./NonPlayerActor";
import { ICombatObject } from "./ActorInterfaces";

abstract class Enemy extends NonPlayerActor implements ICombatObject {
    health: number = 0;
    abstract applyAttack(amount: number, knockback: PIXI.Point): boolean;
}

export default Enemy;