import Map from "../world/Map";
import { GRAVITY } from "../world/physicalConstants";
import World from "../world/World";
import Particle from "./Particle";

export default class DebrisParticle extends Particle {

    public rotationVelocity = 0;
    private image: PIXI.Sprite;

    constructor(texture: PIXI.Texture, world: World) {
        super(60, world);
        this.image = new PIXI.Sprite(texture);
        this.addChild(this.image);
        this.image.anchor.set(0.5);
        this.lifetime = 60;
    }

    public update() {
        if (!this.world.map) return this.destroy();
        this.velocity.y += GRAVITY;
        this.image.rotation += this.rotationVelocity;
        let magnitude = Math.ceil(Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y));
        for (let i = 0; i < magnitude; i ++) {
            if (this.velocity.x !== 0) {
                this.x += this.velocity.x / magnitude;
                if (Map.isWalled(this.world.map.getPixelData(this.x, this.y))) {
                    this.x -= this.velocity.x / magnitude;
                    this.velocity.x = 0;
                }
                if (Map.isPassable(this.world.map.getPixelData(this.x, this.y))) {
                    this.y --;
                }
            }
            if (this.velocity.y !== 0) {
                this.y += this.velocity.y / magnitude;
                if ((this.velocity.y < 0) && Map.isSolid(this.world.map.getPixelData(this.x, this.y)) ||
                    (this.velocity.y > 0) && Map.isWalkable(this.world.map.getPixelData(this.x, this.y)))
                {
                    this.y -= this.velocity.y / magnitude;
                    this.velocity.y = 0;
                }
            }
            if (this.velocity.x === 0 && this.velocity.y === 0) break;
        }
        if (this.velocity.y === 0) {
            this.velocity.x *= 0.95;
            this.rotationVelocity *= 0.95;
        }
        if (Math.abs(this.velocity.x) < 1 && Math.abs(this.velocity.y) < 1) {
            this.lifetime --;
            this.alpha = Math.ceil(this.lifetime / 15) / 4;
            if (this.lifetime <= 0) {
                this.destroy();
            }
        }
    }
}
