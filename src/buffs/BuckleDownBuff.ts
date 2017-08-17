import Actor from "../actors/Actor";
import Enemy from "../actors/Enemy";
import Player from "../actors/Player";
import World from "../world/World";
import Buff, { BuffEvent } from "./Buff";

export default class BuckleDownBuff extends Buff {

    constructor(duration: number, source = "World") {
        super(4, "Hardened", source, duration);
    }

    public onCreate(actor: Actor) {
        if (!Player.isPlayer(actor)) return;
        actor.tintAll(0xDDDDEE);
    }

    public onExpire(actor: Actor) {
        if (!Player.isPlayer(actor)) return;
        actor.untintAll(0xDDDDEE);
    }

    public onEvent(name: BuffEvent, payload?: any): any {
        if (name === "takeDamage") {
            let damage: { damage: number, knockback: PIXI.Point } = payload;
            return {
                damage: damage.damage * 0.5,
                knockback: new PIXI.Point(0, 0),
            };
        } else {
            return super.onEvent(<any> name, payload);
        }
    }
}
