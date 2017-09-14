import {Particle} from "../particlesystem/Particle";
import {World} from "../world/World";

export abstract class Projectile extends Particle {
    public velocity: PIXI.Point = new PIXI.Point();

    constructor(lifetime: number, world: World, public friendly: boolean) {
        super(lifetime, world);
    }

    public abstract update(): void;
}
