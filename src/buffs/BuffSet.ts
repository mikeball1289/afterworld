import Actor from "../actors/Actor";
import Player from "../actors/Player";
import World from "../world/World";
import Buff, { BuffEvent, ConditionType, IStatBox } from "./Buff";

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
                let buff = this.buffs[i];
                this.buffs.splice(i, 1);
                buff.onExpire(this.actor, this.world);
            } else {
                this.buffs[i].onEvent("frame");
            }
        }
    }

    public hasCondition(condition: ConditionType): boolean {
        for (let buff of this.buffs) {
            if (buff.hasCondition(condition)) return true;
        }
        return false;
    }

    public hasBuff(name: string) {
        for (let buff of this.buffs) {
            if (buff.name === name) return buff;
        }
        return undefined;
    }

    public hasBuffFromSource(source: string) {
        for (let buff of this.buffs) {
            if (buff.source === source) return buff;
        }
        return undefined;
    }

    public process(name: "dealDamage", payload: { damage: IDamageBundle, knockback: PIXI.Point }): { damage: IDamageBundle, knockback: PIXI.Point };
    public process(name: "takeDamage", payload: { damage: IDamageBundle, knockback: PIXI.Point }): { damage: IDamageBundle, knockback: PIXI.Point };
    public process(name: "die", payload: never): void;
    public process(name: "attack", payload: never): void;
    public process(name: "damageDealt", payload: { damage: IDamageBundle, actor: Actor } ): void;
    public process(name: "killedEnemy", payload: Actor): void;
    public process(name: "getStats", payload: IStatBox): number;
    public process(name: BuffEvent, payload?: any): any {
        if (name === "dealDamage" && Player.isPlayer(this.actor)) {
            this.actor.isInCombat = true;
        }
        switch (name) {
            case "dealDamage":
            case "takeDamage": {
                let damage: { damage: IDamageBundle, knockback: PIXI.Point } = payload;
                for (let buff of this.buffs) {
                    damage = buff.onEvent(<any> name, damage);
                }
                return damage;
            }
            case "getStats": {
                let statAmount: number = payload.amount;
                for (let buff of this.buffs) {
                    statAmount = buff.onEvent(<any> name, { stat: payload.stat, amount: statAmount }).amount;
                }
                return statAmount;
            }
            case "die":
            case "attack":
            case "damageDealt":
            case "killedEnemy": {
                for (let buff of this.buffs) {
                    buff.onEvent(<any> name, payload);
                }
                return;
            }
            default: return;
        }
    }
}
