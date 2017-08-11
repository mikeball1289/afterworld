import Actor from "../actors/Actor";
import Player from "../actors/Player";
import World from "../world/World";
import Buff, { ConditionType } from "./Buff";

export default class StunDebuff extends Buff {

    private charges = 3;

    constructor(source = "World") {
        super(2, "Envenomed", source, 360);
    }

    public onCreate(actor: Actor) {
        if (actor instanceof Player) {
            actor.body.weapon.tint = 0xDDFFDD;
        }
    }

    public refresh() {
        this.duration = 360;
        this.charges = 3;
    }

    public onExpire(actor: Actor) {
        if (actor instanceof Player) {
            actor.body.weapon.tint = 0xFFFFFF;
        }
    }
}
