import Actor from "../actors/Actor";
import Enemy from "../actors/Enemy";
import Player from "../actors/Player";
import World from "../world/World";
import Buff, { BuffEvent, IStatBox } from "./Buff";

export default class EnemyPoisonedDebuff extends Buff {

    private timer = 0;
    private actor: Enemy;

    constructor(duration: number, source = "World", private damage: number, private tickTime: number) {
        super(3, "Poisoned", source, duration);
    }

    public onCreate(actor: Actor) {
        if (!Enemy.isEnemy(actor)) throw new Error("Can't poison things that aren't enemies for now");
        this.actor = actor;
        if (actor.tint === 0xFFFFFF) {
            actor.tint = 0xDDFFDD;
        }
    }

    public onExpire(actor: Actor) {
        if (!actor.buffs.hasBuff("Poisoned")) {
            actor.tint = 0xFFFFFF;
        }
    }

    public onEvent(name: BuffEvent, payload?: any): any {
        if (name === "frame") {
            this.timer ++;
            if (this.timer >= this.tickTime) {
                this.actor.applyAttack(this.damage, new PIXI.Point());
                this.timer = 0;
            }
        } else {
            return super.onEvent(<any> name, payload);
        }
    }
}
