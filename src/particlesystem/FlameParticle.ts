import ColorTweener from "../ColorTweener";
import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import Particle from "./Particle";

export default class FlameParticle extends Particle {

    public rotationVelocity = 0;
    private sprite: PIXI.Sprite;

    constructor(private startingLifetime: number, private tinter: ColorTweener, world: World) {
        super(startingLifetime, world);
        this.sprite = new PIXI.Sprite(fromTextureCache("/images/particles.png", 0, 0, 20, 20));
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        this.sprite.tint = this.tinter.getInbetween(0);
    }

    public update() {
        if (!this.world.map) return this.destroy();
        this.y -= 0.6;
        this.lifetime --;
        this.sprite.tint = this.tinter.getInbetween(1 - this.lifetime / this.startingLifetime);
        this.sprite.scale.set(this.lifetime / this.startingLifetime);
        if (this.lifetime < 32) this.alpha = Math.pow(Math.ceil(this.lifetime / 8) / 4, 2);
        if (this.lifetime <= 0) this.destroy();
    }
}
