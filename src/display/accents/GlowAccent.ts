import { fromTextureCache } from "../../pixiTools";
import World from "../../world/World";
import JuggledSprite from "../JuggledSprite";

export default class GlowAccent extends JuggledSprite {

    private image: PIXI.Sprite;

    constructor(private world: World, flip = false, texture?: PIXI.Texture) {
        super();
        if (!texture) texture = fromTextureCache("/images/particles.png", 0, 25, 97, 161);
        this.image = new PIXI.Sprite(fromTextureCache("/images/particles.png", 0, 25, 97, 161));
        this.image.tint = 0xFFF400;
        this.addChild(this.image);
        this.image.alpha = 0.6;
        if (flip) {
            this.image.scale.x = -1;
            this.image.x = this.image.width;
        }
    }

    public get top() {
        return this.y;
    }

    public get bottom() {
        return this.y + this.image.height;
    }

    public get left() {
        return this.x;
    }

    public get right() {
        return this.x + this.image.width;
    }

    public onEnterFrame() {
        let hit = this.world.actorManager.player.hitTest(this);
        if (this.alpha < 1 && hit) {
            this.alpha += 0.01;
        }
        if (this.alpha > 0.6 && !hit) {
            this.alpha -= 0.01;
        }
    }
}
