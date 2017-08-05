import World from "../world/World";
import { GRAVITY } from "../world/physicalConstants";
import Particle from "./Particle";

export default class TextParticle extends Particle {
    
    constructor(value: string, color: number) {
        super();
        let text = new PIXI.Text(value, {
            fontFamily: "SilkscreenNormal",
            fontSize: 32,
            align: "center",
            stroke: 0x383838,
            strokeThickness: 2,
            fill: color,
        } );
        text.anchor.set(0.5, 1);
        this.addChild(text);
        this.lifetime = 20;
    }

    update(world: World) {
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