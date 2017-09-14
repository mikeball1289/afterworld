import {ColorTweener} from "../ColorTweener";
import {FlameParticle} from "../particlesystem/FlameParticle";
import {fromTextureCache} from "../pixiTools";
import {soundManager} from "../root";
import {World} from "../world/World";
import {Projectile} from "./Projectile";

const tinter = new ColorTweener(0xBAFFF8, 0x0000FF);
const PHASE_1_TIME = 90;
const PHASE_2_TIME = 30;

export class WilloFlame extends Projectile {

    public damage: IDamageBundle;
    private image: PIXI.Sprite;
    private ignite = false;

    constructor(private totalLifetime: number, world: World, damage: number, private radius: number, private origin: PIXI.Point, private speed: number,
                private angleOffset = 0, private extraDelay = 0, private phase1Time = PHASE_1_TIME, private phase2Time = PHASE_2_TIME)
    {
        super(totalLifetime, world, true);
        this.image = new PIXI.Sprite(fromTextureCache("/images/particles.png", 0, 0, 20, 20));
        this.image.tint = 0x0000FF;
        this.image.anchor.set(0.5);
        this.addChild(this.image);
        this.damage = { amount: damage, type: "magic", element: "fire" };
    }

    public update() {
        if (this.lifetime > this.totalLifetime - this.phase1Time) {
            let p1t = this.totalLifetime - this.lifetime;
            let angle = p1t / this.phase1Time * Math.PI * 2 + this.angleOffset;
            let radius = Math.sqrt(p1t / this.phase1Time) * this.radius;
            this.x = this.origin.x + Math.sin(angle) * radius;
            this.y = this.origin.y - Math.cos(angle) * radius;
        } else if (this.lifetime > this.totalLifetime - this.phase1Time - this.phase2Time - this.extraDelay) {
            let angle = Math.PI * 2 + this.angleOffset;
            this.x = this.origin.x + Math.sin(angle) * this.radius;
            this.y = this.origin.y - Math.cos(angle) * this.radius;
        } else if (!this.ignite) {
            this.ignite = true;
            soundManager.playSound("/sounds/poof.ogg");
            let player = this.world.actorManager.player;
            let dx = player.horizontalCenter - this.x;
            let dy = player.verticalCenter - this.y;
            let hm = Math.sqrt(dx * dx + dy * dy);
            this.velocity.x = dx / hm * this.speed;
            this.velocity.y = dy / hm * this.speed;
        }

        let c = this.moveAsPoint();
        if (c[0] || c[1]) {
            return this.destroy();
        }

        let player = this.world.actorManager.player;
        if (this.ignite && !player.isDead()) {
            if (player.containsPoint(this.position)) {
                if (player.applyDamage(this.damage)) {
                    return this.destroy();
                }
            }
        }

        let particle = new FlameParticle(60, tinter, this.world);
        particle.x = this.x + Math.random() * 10 - 5;
        particle.y = this.y + Math.random() * 10 - 5;
        this.world.particleSystem.add(particle);

        this.lifetime --;
        if (this.lifetime < 20) {
            this.alpha = Math.ceil(this.lifetime / 4) / 5;
        }
        if (this.lifetime < -this.extraDelay) {
            this.destroy();
        }
    }
}
