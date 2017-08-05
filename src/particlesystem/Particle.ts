import ParticleSystem from "./ParticleSystem";
import World from "../world/World";

abstract class Particle extends PIXI.Container {
    
    static ID_IDX: number = 0;

    public velocity: PIXI.Point = new PIXI.Point();
    private system?: ParticleSystem;
    public layer?: PIXI.Container;
    public id: number;

    constructor(public lifetime = 60) {
        super();
        this.id = Particle.ID_IDX ++;
    }

    abstract update(world: World): void;

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        if (this.system) this.system.remove(this);
        this.system = undefined;
        this.layer = undefined;
        super.destroy(options);
    }

    linkSystem(pc: ParticleSystem, layer: PIXI.Container) {
        this.system = pc;
        this.layer = layer;
    }

}

export default Particle;