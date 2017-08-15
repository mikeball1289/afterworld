import World from "../world/World";
import Particle from "./Particle";

export default class GenericEffectParticle extends Particle {

    private sprite: PIXI.Sprite;

    constructor(private startingLifetime: number, texture: PIXI.Texture) {
        super();
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        this.lifetime = startingLifetime;
    }

    public update(world: World) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        this.lifetime --;
        if (this.lifetime < this.startingLifetime / 2) this.alpha = Math.pow(Math.ceil(this.lifetime / this.startingLifetime * 8) / 4, 2);
        if (this.lifetime <= 0) this.destroy();
    }
}
