import Actor from "../actors/Actor";
import ColorTweener from "../ColorTweener";
import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import Particle from "./Particle";

export default class VacuumParticle extends Particle {

    private sprite: PIXI.Sprite;

    constructor(private offset: PIXI.Point, private actor: Actor, lifetime: number, private travelTime: number, private tinter: ColorTweener, world: World) {
        super(lifetime, world);
        this.sprite = new PIXI.Sprite(fromTextureCache("/images/particles.png", 70, 0, 1, 16));
        this.sprite.anchor.set(0, 1);
        this.sprite.tint = tinter.getInbetween(0);
        this.addChild(this.sprite);
        this.x = actor.horizontalCenter + offset.x;
        this.y = actor.verticalCenter + offset.y;
    }

    public update(): void {
        this.lifetime --;
        if (this.lifetime >= this.travelTime) {
            this.alpha = Math.max(0, this.travelTime - this.lifetime + 10) / 10;
            this.x = this.actor.horizontalCenter + this.offset.x;
            this.y = this.actor.verticalCenter + this.offset.y;
        } else {
            if (this.lifetime <= 0) {
                this.destroy();
            } else {
                let progress = this.lifetime / this.travelTime;
                progress = 1 - progress;
                this.sprite.tint = this.tinter.getInbetween(progress);
                progress *= progress;
                progress = 1 - progress;
                this.x = (this.offset.x) * progress + this.actor.horizontalCenter;
                this.y = (this.offset.y) * progress + this.actor.verticalCenter;
            }
        }
    }

}
