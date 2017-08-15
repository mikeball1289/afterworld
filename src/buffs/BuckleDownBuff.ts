import Actor from "../actors/Actor";
import Enemy from "../actors/Enemy";
import Player from "../actors/Player";
import World from "../world/World";
import Buff, { BuffEvent } from "./Buff";

export default class BuckleDownBuff extends Buff {

    private timer = 0;
    private actor: Enemy;

    constructor(duration: number, source = "World") {
        super(4, "Hardened", source, duration);
    }

    public onEvent(name: BuffEvent, payload?: any): any {
        if (name === "takeDamage") {
            return payload * 0.5;
        } else {
            return super.onEvent(<any> name, payload);
        }
    }
}
