import World from "../world/World";
import ParticleSystem from "./ParticleSystem";

abstract class Particle extends PIXI.Container {

    private static ID_IDX: number = 0;

    public velocity: PIXI.Point = new PIXI.Point();
    public id: number;
    private system?: ParticleSystem;

    constructor(public lifetime = 60) {
        super();
        this.id = Particle.ID_IDX ++;
    }

    public abstract update(world: World): void;

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        if (this.system) this.system.remove(this);
        this.system = undefined;
        super.destroy(options);
    }

    public linkSystem(pc: ParticleSystem) {
        this.system = pc;
    }

}

export default Particle;
