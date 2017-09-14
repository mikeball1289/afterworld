import {World} from "../world/World";
import {Particle} from "./Particle";

export class GenericEffectParticle extends Particle {

    public rotationSpeed = 0;
    public sprite: PIXI.Sprite;

    constructor(private startingLifetime: number, texture: PIXI.Texture, world: World, rotation = 0, public flip = false) {
        super(startingLifetime, world);
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        if (flip) {
            this.sprite.scale.x = -1;
        }
        this.rotation = rotation;
        this.addChild(this.sprite);
    }

    public update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        this.rotationSpeed *= 0.99;
        this.lifetime --;
        if (this.lifetime < this.startingLifetime / 2) this.alpha = Math.pow(Math.ceil(this.lifetime / this.startingLifetime * 8) / 4, 2);
        if (this.lifetime <= 0) this.destroy();
    }
}
