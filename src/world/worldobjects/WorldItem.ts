import Player from "../../actors/Player";
import InventoryItem from "../../data/items/InventoryItem";
import Map from "../Map";
import { GRAVITY } from "../physicalConstants";
import World from "../World";

export default class WorldItem extends PIXI.Container {

    public velocity: PIXI.Point;
    private sprite: PIXI.Sprite;

    constructor(public item: InventoryItem) {
        super();
        this.velocity = new PIXI.Point();
        this.sprite = new PIXI.Sprite(item.graphic);
        this.sprite.anchor.set(0.5, 0.9);
        this.addChild(this.sprite);
    }

    public update(world: World) {
        if (!world.map) return;
        this.velocity.y += GRAVITY;
        let magnitude = Math.ceil(Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y));
        for (let i = 0; i < magnitude; i ++) {
            if (this.velocity.x !== 0) {
                this.x += this.velocity.x / magnitude;
                if (Map.isWalled(world.map.getPixelData(this.x, this.y))) {
                    this.x -= this.velocity.x / magnitude;
                    this.velocity.x = 0;
                }
                if (Map.isPassable(world.map.getPixelData(this.x, this.y))) {
                    this.y --;
                }
            }
            if (this.velocity.y !== 0) {
                this.y += this.velocity.y / magnitude;
                if ((this.velocity.y < 0) && Map.isSolid(world.map.getPixelData(this.x, this.y)) ||
                    (this.velocity.y > 0) && Map.isWalkable(world.map.getPixelData(this.x, this.y)))
                {
                    this.y -= this.velocity.y / magnitude;
                    this.velocity.y = 0;
                    this.velocity.x = 0;
                }
            }
            if (this.velocity.x === 0 && this.velocity.y === 0) break;
        }
    }

    public withinPickupRange(player: Player) {
        return this.x - 20 < player.right && this.x + 20 > player.left && this.y > player.top && this.y - 10 < player.bottom;
    }
}
