import Particle from "./Particle";
import World from "../world/World";

export default class ParticleSystem extends PIXI.Container {

    private particles: {[id: number]: Particle} = {};
    private uiLayer: PIXI.Container;
    private midgroundLayer: PIXI.Container;

    constructor(private world: World) {
        super();
        this.midgroundLayer = new PIXI.Container();
        this.addChild(this.midgroundLayer);
        this.uiLayer = new PIXI.Container();
        this.addChild(this.uiLayer);
    }

    remove(particle: Particle) {
        if (this.particles[particle.id]) {
            if (particle.layer) particle.layer.removeChild(particle);
            delete this.particles[particle.id];
        }
    }

    add(particle: Particle, layer: "ui" | "midground" = "midground") {
        if (this.particles[particle.id]) return;
        this.particles[particle.id] = particle;
        switch(layer) {
            case "ui": {
                this.uiLayer.addChild(particle);
                particle.linkSystem(this, this.uiLayer);
                break;
            }
            case "midground": {
                this.midgroundLayer.addChild(particle);
                particle.linkSystem(this, this.midgroundLayer);
                break;
            }
        }
    }

    update() {
        for (let id in this.particles) {
            this.particles[id].update(this.world);
        }
    }
}