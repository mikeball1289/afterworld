import {Animator} from "../../display/Animator";
import {fromTextureCache} from "../../pixiTools";
import {Map} from "../Map";
import {GRAVITY} from "../physicalConstants";
import {World} from "../World";

export class Coin extends PIXI.Container {

    public velocity: PIXI.Point;
    private sprite: Animator<{bronze: [number, number], gold: [number, number], silver: [number, number]}>;

    constructor(amount: number) {
        super();
        this.sprite = new Animator(fromTextureCache("/images/coins.png"), new PIXI.Point(20, 30), {
            bronze: [0, 4],
            silver: [1, 4],
            gold: [2, 4],
        }, "bronze", 8);
        this.sprite.anchor.set(0.5, 1);
        this.addChild(this.sprite);
        this.velocity = new PIXI.Point();
    }

    public update(world: World) {
        this.velocity.y += GRAVITY;
        if (!world.map) return;
        let magnitude = Math.ceil(Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y));
        for (let i of range(0, magnitude)) {
            if (this.velocity.x !== 0) {
                this.x += this.velocity.x / magnitude;
                if (Map.isWalkable(world.map.getPixelData(this.x, this.y)) && !Map.isWalkable(world.map.getPixelData(this.x, this.y - 1))) {
                    this.y --;
                }
                if (Map.isWalled(world.map.getPixelData(this.x, this.y))) {
                    this.x -= this.velocity.x / magnitude;
                    this.velocity.x *= -0.5;
                }
            }
            if (this.velocity.y !== 0) {
                this.y += this.velocity.y / magnitude;
                if ((this.velocity.y < 0) && Map.isSolid(world.map.getPixelData(this.x, this.y)) ||
                    (this.velocity.y > 0) && Map.isWalkable(world.map.getPixelData(this.x, this.y)))
                {
                    this.y -= this.velocity.y / magnitude;
                    this.velocity.y *= -0.5;
                    this.velocity.x *= 0.8;
                }
            } else {
                this.velocity.x *= 0.8;
            }
            if (this.velocity.x === 0 && this.velocity.y === 0) break;
        }
        if (this.velocity.y === 0) {
            this.velocity.x *= 0.95;
        }
    }
}
