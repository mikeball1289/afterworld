import Actor from "../actors/Actor";
import World from "../world/World";

export type BuffEvent = "dealDamage" | "takeDamage" | "die" | "attack" | "damageDealt" | "killedEnemy" | "getStats" | "frame";
export type ConditionType = "invisible" | "intangible" | "stunned";

export interface IStatBox {
    stat: string;
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

    public onEvent(name: "dealDamage", payload: { damage: number, knockback: PIXI.Point }): { damage: number, knockback: PIXI.Point };
    public onEvent(name: "takeDamage", payload: { damage: number, knockback: PIXI.Point }): { damage: number, knockback: PIXI.Point };
    public onEvent(name: "die"): void;
    public onEvent(name: "attack"): void;
    public onEvent(name: "damageDealt", payload: Actor): void;
    public onEvent(name: "killedEnemy", payload: Actor): void;
    public onEvent(name: "getStats", payload: IStatBox): IStatBox;
    public onEvent(name: "frame"): void;
    public onEvent(name: BuffEvent, payload?: any): any {
        return payload;
    }
}
