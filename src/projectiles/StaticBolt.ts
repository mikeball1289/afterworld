import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import Projectile from "./Projectile";

export default class StaticBolt extends Projectile {

    public damage: IDamageBundle;
    private staticTimer = 0;
    private staticGraphic: PIXI.Sprite;

    constructor(world: World, damage: number) {
        super(180, world, true);
        this.staticGraphic = new PIXI.Sprite(fromTextureCache("/images/particles.png", 72, 0, 20, 20));
        this.staticGraphic.tint = 0x00C4C1;
        this.staticGraphic.filters = [new PIXI.filters.GlowFilter(4, 1, 0, 0xBFFFFC)];
        this.staticGraphic.anchor.set(0.5);
        this.addChild(this.staticGraphic);
        this.damage = { amount: damage, type: "magic", element: "electric" };
    }

    public update() {
        this.staticTimer ++;
        if (this.staticTimer >= 3) {
            this.staticTimer = 0;
            this.staticGraphic.rotation = Math.random() * Math.PI * 2;
        }

        let collisions = this.moveAsPoint();
        if (collisions[0]) this.velocity.x *= -1;
        if (collisions[1]) this.velocity.y *= -1;
        if (Math.random() < 1 / 10) {
            this.velocity.y = (Math.random() + 1) * (Math.random() < 0.5 ? -1 : 1);
            this.velocity.x = (Math.random() + 1.5) * (this.velocity.x < 0 ? -1 : 1);
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
