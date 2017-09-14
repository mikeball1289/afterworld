import {Actor} from "../actors/Actor";
import {Player} from "../actors/Player";
import {World} from "../world/World";
import {Buff, BuffEvent} from "./Buff";
import {EnemyPoisonedDebuff} from "./EnemyPoisonedDebuff";

export class EnvenomedBuff extends Buff {

    private charges = 3;

    constructor(public damage: number, source = "World") {
        super(2, "Envenomed", source, Infinity);
    }

    public onCreate(actor: Actor) {
        if (Player.isPlayer(actor)) {
            actor.body.weapon.tints.addTint(0xAAFFAA);
        }
    }

    public refresh(damage?: number) {
        this.charges = 3;
        this.duration = Infinity;
        if (damage) {
            this.damage = damage;
        }
    }

    public onExpire(actor: Actor) {
        if (Player.isPlayer(actor)) {
            actor.body.weapon.tints.removeTint(0xAAFFAA);
        }
    }

    public onEvent(name: BuffEvent, payload?: any): any {
        if (name === "damageDealt") {
            if ((<IDamageBundle> payload.damage).type === "physical" && this.charges > 0) {
                let enemy: Actor = payload.actor;
                enemy.buffs.addBuff(new EnemyPoisonedDebuff(180, "Envenom", Math.ceil(this.damage / 6), 30));
                this.charges --;
                if (this.charges <= 0) {
                    this.duration = 0;
                }
            }
        } else {
            return super.onEvent(<any> name, payload);
        }
    }
}
