import Actor from "../actors/Actor";
import { IEquipmentStats } from "../data/items/EquipmentItem";
import World from "../world/World";

export type BuffStat = keyof IEquipmentStats | "jumpPower" | "criticalHitChance";
export type BuffEvent = "dealDamage" | "takeDamage" | "die" | "attack" | "damageDealt" | "killedEnemy" | "getStats" | "frame";
export type ConditionType = "invisible" | "intangible" | "stunned";

export interface IStatBox {
    stat: BuffStat;
    amount: number;
}

export default class Buff {

    constructor(public id: number, public name: string, public source: string, public duration: number) { }

    public onCreate(actor: Actor, world: World): void {
        return;
    }
    public onExpire(actor: Actor, world: World): void {
        return;
    }
    public hasCondition(condition: ConditionType): boolean {
        return false;
    }

    public onEvent(name: "dealDamage", payload: { damage: IDamageBundle, knockback: PIXI.Point }): { damage: IDamageBundle, knockback: PIXI.Point };
    public onEvent(name: "takeDamage", payload: { damage: IDamageBundle, knockback: PIXI.Point }): { damage: IDamageBundle, knockback: PIXI.Point };
    public onEvent(name: "die", payload: never): void;
    public onEvent(name: "attack", payload: never): void;
    public onEvent(name: "damageDealt", payload: { damage: IDamageBundle, actor: Actor } ): void;
    public onEvent(name: "killedEnemy", payload: Actor): void;
    public onEvent(name: "getStats", payload: IStatBox): IStatBox;
    public onEvent(name: "frame"): void;
    public onEvent(name: BuffEvent, payload?: any): any {
        return payload;
    }
}
