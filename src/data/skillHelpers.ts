import Enemy from "../actors/Enemy";
import Player from "../actors/Player";
import World from "../world/World";

export interface ISkillFunction {
    (player: Player, world: World): boolean;
}

export const swishes = ["/sounds/swish1.ogg", "/sounds/swish2.ogg", "/sounds/swish3.ogg"];
export const BASIC_ATTACKS: ["attack1", "attack2"] = ["attack1", "attack2"];

export function getAttackBox(player: Player) {
    if (!player.inventory.equipment.weapon) return new PIXI.Rectangle(player.horizontalCenter, player.top + player.size.y * 0.4, 1, 1);
    return new PIXI.Rectangle(player.horizontalCenter, player.top + player.size.y * 0.4, player.inventory.equipment.weapon.range + 15, 25);
}

export function applyAttack(player: Player, enemy: Enemy, damage: IDamageBundle, knockback: PIXI.Point) {
    let {damage: d, knockback: k} = player.buffs.process("dealDamage", { damage, knockback} );
    d.amount = Math.ceil(d.amount);
    damage = d;
    knockback = k;
    if (enemy.applyAttack(damage, knockback)) {
        player.buffs.process("damageDealt", { damage, actor: enemy });
        if (enemy.health <= 0) {
            player.buffs.process("killedEnemy", enemy);
        }
        return true;
    }
    return false;
}
