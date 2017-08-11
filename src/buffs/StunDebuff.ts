import Actor from "../actors/Actor";
import World from "../world/World";
import Buff, { ConditionType } from "./Buff";

export default class StunDebuff extends Buff {
    private stunGraphic: PIXI.Sprite;

    constructor(duration: number, source = "World") {
        super(1, "Stun", source, duration);
        this.stunGraphic = new PIXI.Sprite(new PIXI.Texture(PIXI.loader.resources["/images/effect_icons.png"].texture.baseTexture,
                                            new PIXI.Rectangle(0, 0, 30, 30)));
        this.stunGraphic.anchor.set(0.5, 1);
    }

    public hasCondition(condition: ConditionType) {
        return condition === "stunned";
    }

    public onCreate(actor: Actor) {
        this.stunGraphic.x = actor.size.x / 2;
        this.stunGraphic.y = -5;
        actor.addChild(this.stunGraphic);
    }

    public onExpire() {
        if (this.stunGraphic.parent) {
            this.stunGraphic.parent.removeChild(this.stunGraphic);
        }
        this.stunGraphic.destroy();
        this.stunGraphic = <any> undefined;
    }
}
