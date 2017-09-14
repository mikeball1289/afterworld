import {Actor} from "../actors/Actor";
import {Enemy} from "../actors/Enemy";
import {Player} from "../actors/Player";
import {World} from "../world/World";
import {Buff, BuffEvent, IStatBox} from "./Buff";

export class EnemyPoisonedDebuff extends Buff {

    private timer = 0;
    private actor: Enemy;

    constructor(duration: number, source = "World", private damage: number, private tickTime: number) {
        super(3, "Poisoned", source, duration);
    }

    public onCreate(actor: Actor) {
        if (!Enemy.isEnemy(actor)) throw new Error("Can't poison things that aren't enemies for now");
        this.actor = actor;
        actor.animator.tints.addTint(0xAAFFAA);
    }

    public onExpire(actor: Actor) {
        if (!Enemy.isEnemy(actor)) throw new Error("Can't poison things that aren't enemies for now");
        actor.animator.tints.removeTint(0xAAFFAA);
    }

    public onEvent(name: BuffEvent, payload?: any): any {
        if (name === "frame") {
            this.timer ++;
            if (this.timer >= this.tickTime) {
                this.actor.applyAttack( { amount: this.damage, type: "physical", element: "poison" }, new PIXI.Point());
                this.timer = 0;
            }
        } else {
            return super.onEvent(<any> name, payload);
        }
    }
}
