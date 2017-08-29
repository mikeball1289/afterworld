import World from "../world/World";
import Particle from "./Particle";

export default class SoftTextParticle extends Particle {

    constructor(value: string, color: number, world: World) {
        super(40, world);
        let text = new PIXI.Text(value, {
            fontFamily: DEFAULT_FONT,
            fontSize: 18,
            align: "center",
            stroke: 0x383838,
            strokeThickness: 1,
            fill: color,
        } );
        text.anchor.set(0.5, 1);
        this.addChild(text);
        this.lifetime = 40;
    }

    public update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.lifetime --;
        this.alpha = Math.ceil(this.lifetime / 10) / 4;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }
}
