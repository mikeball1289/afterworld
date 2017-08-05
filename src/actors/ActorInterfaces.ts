export interface ICombatObject {
    health: number;
    // attempt to apply an attack to the combat object, return true if the attack was successfully applied
    applyAttack(damage: number, knockback: PIXI.Point): boolean;
}