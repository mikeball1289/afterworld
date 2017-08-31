import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import Projectile from "./Projectile";

export default class SentinelFlame extends Projectile {

    public damage: IDamageBundle;
    private image: PIXI.Sprite;

    constructor(world: World, damage: number, lifetime: number, private orbitSpeed: number, private nOrbits: number, private radius: number) {
        super(lifetime, world, true);
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
            let angle = this.lifetime / this.orbitSpeed * Math.PI * 2;
            this.x = player.horizontalCenter - Math.sin(angle) * this.radius;
            this.y = player.verticalCenter - Math.cos(angle) * this.radius;
        }

        for (let enemy of this.world.actorManager.enemies) {
            if (this.x > enemy.left && this.x < enemy.right && this.y > enemy.top && this.y < enemy.bottom) {
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
