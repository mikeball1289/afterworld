import Actor from "../actors/Actor";
import TextParticle from "./TextParticle";

type SourceType = "enemyDamage" |
                  "playerDamage";

export default class DamageParticle extends TextParticle {

    public static colorOf(sourceType: SourceType) {
        switch (sourceType) {
            case "enemyDamage": return 0xFF0000;
            case "playerDamage": return 0xFFC956;
            default: return 0xFFFFFF;
        }
    }

    constructor(amount: number, sourceType: SourceType, source: Actor) {
        super(amount.toFixed(), DamageParticle.colorOf(sourceType));
        this.x = source.horizontalCenter;
        this.y = source.top;
        this.velocity.x = (Math.random() - 0.5) * 2;
        this.velocity.y = Math.random() - 3;
    }
}
