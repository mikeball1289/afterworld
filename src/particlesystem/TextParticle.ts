import {GRAVITY} from "../world/physicalConstants";
import {World} from "../world/World";
import {Particle} from "./Particle";

export class TextParticle extends Particle {

    constructor(value: string, color: number, world: World) {
        super(20, world);
        let text = new PIXI.Text(value, {
            fontFamily: DEFAULT_FONT,
            fontSize: 32,
            align: "center",
            stroke: 0x383838,
            strokeThickness: 2,
            fill: color,
        } );
        text.anchor.set(0.5, 1);
        this.addChild(text);
    }

    public update() {
        this.velocity.y += GRAVITY / 4;

        this.x += this.velocity.x;
        this.y += this.velocity.y;
        if (this.velocity.y >= 0) {
            this.lifetime --;
            this.alpha = Math.ceil(this.lifetime / 10) / 2;
            if (this.lifetime <= 0) {
                this.destroy();
            }
        }
    }
}
