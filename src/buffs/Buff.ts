import Actor from "../actors/Actor";
import World from "../world/World";

export type BuffEvent = "dealDamage" | "takeDamage" | "die" | "attack" | "damageDealt" | "killedEnemy" | "getStats" | "frame";

abstract class Buff {

    constructor(public id: number, public name: string, public source: string, public duration: number) { }

    public abstract onCreate(actor: Actor, world: World): void;
    public abstract onExpire(actor: Actor, world: World): void;

    public abstract onEvent(name: "dealDamage", payload: number): number;
    public abstract onEvent(name: "takeDamage", payload: number): number;
    public abstract onEvent(name: "die"): void;
    public abstract onEvent(name: "attack"): void;
    public abstract onEvent(name: "damageDealt", payload: Actor): void;
    public abstract onEvent(name: "killedEnemy", payload: Actor): void;
    public abstract onEvent(name: "getStats", payload: { stat: string, amount: number }): number;
    public abstract onEvent(name: "frame"): void;
    public abstract onEvent(name: BuffEvent, payload?: any): any;
}

export default Buff;
