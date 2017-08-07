import ColorTweener from "../ColorTweener";
import Map from "../world/Map";
import { GRAVITY } from "../world/physicalConstants";
import World from "../world/World";
import Particle from "./Particle";

export default class FireParticle extends Particle {

    public rotationVelocity = 0;
    private sprite: PIXI.Sprite;

    constructor(private startingLifetime: number, private tinter: ColorTweener) {
        super();
        this.sprite = new PIXI.Sprite(PIXI.loader.resources["/images/fire_particle.png"].texture);
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        this.sprite.tint = this.tinter.getInbetween(0);
        this.lifetime = startingLifetime;
    }

    public update(world: World) {
        if (!world.map) return this.destroy();
        let magnitude = Math.ceil(Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y));
        for (let i = 0; i < magnitude; i ++) {
            if (this.velocity.x !== 0) {
                this.x += this.velocity.x / magnitude;
                if (Map.isWalled(world.map.getPixelData(this.x, this.y))) {
                    this.x -= this.velocity.x / magnitude;
                    this.velocity.x = 0;
                }
                if (Map.isPassable(world.map.getPixelData(this.x, this.y))) {
                    this.y --;
                }
            }
            if (this.velocity.y !== 0) {
                this.y += this.velocity.y / magnitude;
                if ((this.velocity.y < 0) && Map.isSolid(world.map.getPixelData(this.x, this.y)) ||
                    (this.velocity.y > 0) && Map.isWalkable(world.map.getPixelData(this.x, this.y)))
                {
                    this.y -= this.velocity.y / magnitude;
                    this.velocity.y = 0;
                }
            }
            if (this.velocity.x === 0 && this.velocity.y === 0) break;
        }
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        this.lifetime --;
        this.sprite.tint = this.tinter.getInbetween(1 - this.lifetime / this.startingLifetime);
        this.sprite.scale.set(2 - this.lifetime / this.startingLifetime);
        if (this.lifetime < 32) this.alpha = Math.pow(Math.ceil(this.lifetime / 8) / 4, 2);
        if (this.lifetime <= 0) this.destroy();
    }
}
