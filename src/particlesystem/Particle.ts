import Map from "../world/Map";
import World from "../world/World";
import ParticleSystem from "./ParticleSystem";

abstract class Particle extends PIXI.Container {

    private static ID_IDX: number = 0;

    public velocity: PIXI.Point = new PIXI.Point();
    public id: number;
    private system?: ParticleSystem;

    constructor(public lifetime = 60, public world: World) {
        super();
        this.id = Particle.ID_IDX ++;
    }

    public abstract update(): void;

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        if (this.system) this.system.remove(this);
        this.system = undefined;
        super.destroy(options);
    }

    public linkSystem(pc: ParticleSystem) {
        this.system = pc;
    }

    protected moveAsPoint(): [boolean, boolean] {
        if (!this.world.map) return [false, false];
        let collisions: [boolean, boolean] = [false, false];
        let magnitude = Math.ceil(Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y));
        for (let i = 0; i < magnitude; i ++) {
            if (this.velocity.x !== 0) {
                this.x += this.velocity.x / magnitude;
                if (Map.isWalled(this.world.map.getPixelData(this.x, this.y))) {
                    this.x -= this.velocity.x / magnitude;
                    collisions[0] = true;
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
                    collisions[1] = true;
                }
            }
            if (this.velocity.x === 0 && this.velocity.y === 0) break;
        }
        return collisions;
    }

}

export default Particle;
