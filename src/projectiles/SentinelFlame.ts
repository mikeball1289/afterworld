import ColorTweener from "../ColorTweener";
import FlameParticle from "../particlesystem/FlameParticle";
import { fromTextureCache } from "../pixiTools";
import { soundManager } from "../root";
import World from "../world/World";
import Projectile from "./Projectile";

const tinter = new ColorTweener(0xFFD151, 0xFF0000);

export default class SentinelFlame extends Projectile {

    public damage: IDamageBundle;
    private image: PIXI.Sprite;
    private ignite = false;

    constructor(world: World, damage: number, lifetime: number, private orbitSpeed: number, private nOrbits: number, private radius: number) {
        super(lifetime, world, false);
        this.image = new PIXI.Sprite(fromTextureCache("/images/particles.png", 0, 0, 20, 20));
        this.image.tint = 0xFF0000;
        this.image.anchor.set(0.5);
        this.addChild(this.image);
        this.damage = { amount: damage, type: "magic", element: "fire" };
    }

    public update() {
        let player = this.world.actorManager.player;
        if (this.lifetime > this.orbitSpeed * this.nOrbits) {
            this.x = player.horizontalCenter;
            this.y = player.verticalCenter - this.radius;
            this.alpha = (this.orbitSpeed * this.nOrbits - this.lifetime) / 30 + 1;
        } else {
            if (!this.ignite) {
                soundManager.playSound("/sounds/poof.ogg");
                this.ignite = true;
            }
            let angle = this.lifetime / this.orbitSpeed * Math.PI * 2;
            this.x = player.horizontalCenter - Math.sin(angle) * this.radius;
            this.y = player.verticalCenter - Math.cos(angle) * this.radius;

            let particle = new FlameParticle(60, tinter, this.world);
            particle.x = this.x + Math.random() * 10 - 5;
            particle.y = this.y + Math.random() * 10 - 5;
            this.world.particleSystem.add(particle);
        }

        for (let enemy of this.world.actorManager.enemies) {
            if (enemy.containsPoint(this.position)) {
                if (enemy.applyAttack(this.damage)) {
                    return this.destroy();
                }
            }
        }

        this.lifetime --;
        if (this.lifetime < 20) {
            this.alpha = Math.ceil(this.lifetime / 4) / 5;
        }
        if (this.lifetime < 0) {
            this.destroy();
        }
    }
}
