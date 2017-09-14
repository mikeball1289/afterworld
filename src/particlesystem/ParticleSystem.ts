// tslint:disable forin
import {Projectile} from "../projectiles/Projectile";
import {World} from "../world/World";
import {Particle} from "./Particle";

export class ParticleSystem extends PIXI.Container {

    private particles: {[id: number]: Particle} = {};

    constructor(private world: World) {
        super();
    }

    public remove(particle: Particle) {
        if (this.particles[particle.id]) {
            if (particle.parent) particle.parent.removeChild(particle);
            delete this.particles[particle.id];
        }
    }

    public add(particle: Particle, addToSelf = true) {
        if (this.particles[particle.id]) return;
        this.particles[particle.id] = particle;
        particle.linkSystem(this);
        if (addToSelf) this.addChild(particle);
    }

    public update() {
        for (let id in this.particles) {
            this.particles[id].update();
        }
    }

    public removeAll() {
        for (let id in this.particles) {
            this.remove(this.particles[id]);
        }
    }
}
