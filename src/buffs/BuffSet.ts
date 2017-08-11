import Actor from "../actors/Actor";
import World from "../world/World";
import Buff, { BuffEvent } from "./Buff";

export default class BuffSet {

    private buffs: Buff[] = [];

    constructor(private actor: Actor, private world: World) { }

    public addBuff(buff: Buff) {
         this.buffs.push(buff);
         buff.onCreate(this.actor, this.world);
    }

    public tick() {
        for (let i = this.buffs.length - 1; i >= 0; i --) {
            this.buffs[i].duration --;
            if (this.buffs[i].duration <= 0) {
                this.buffs[i].onExpire(this.actor, this.world);
                this.buffs.splice(i, 1);
            } else {
                this.buffs[i].onEvent("frame");
            }
        }
    }

    public process(name: "dealDamage", payload: number): number;
    public process(name: "takeDamage", payload: number): number;
    public process(name: "die"): void;
    public process(name: "attack"): void;
    public process(name: "damageDealt", payload: Actor): void;
    public process(name: "killedEnemy", payload: Actor): void;
    public process(name: "getStats", payload: { stat: string, amount: number }): number;
    public process(name: BuffEvent, payload?: any): any {
        switch (name) {
            case "dealDamage":
            case "takeDamage": {
                let damage: number = payload;
                for (let buff of this.buffs) {
                    damage = buff.onEvent(name, damage);
                }
                break;
            }
            case "getStats": {
                let statAmount: number = payload.amount;
                for (let buff of this.buffs) {
                    statAmount = buff.onEvent(name, { stat: payload.stat, amount: statAmount });
                }
            }
            case "die":
            case "attack":
            case "damageDealt":
            case "killedEnemy": {
                for (let buff of this.buffs) {
                    buff.onEvent(name, payload);
                }
            }
            default: return;
        }
    }
}