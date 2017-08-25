export interface ICombatObject {
    health: number;
    // attempt to apply an attack to the combat object, return true if the attack was successfully applied
    applyAttack(damage: IDamageBundle, knockback: PIXI.Point): boolean;
}
