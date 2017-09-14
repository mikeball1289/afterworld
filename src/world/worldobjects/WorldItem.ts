import {Player} from "../../actors/Player";
import {InventoryItem} from "../../data/items/InventoryItem";
import {juggler} from "../../root";
import {Map} from "../Map";
import {GRAVITY} from "../physicalConstants";
import {World} from "../World";

export class WorldItem extends PIXI.Container {

    public velocity: PIXI.Point;
    private pickupDuration: number = 0;
    private sprite: PIXI.Sprite;
    private targetPlayer: Player;

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
        for (let i of range(0, magnitude)) {
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

    public pickup(player: Player) {
        this.targetPlayer = player;
        this.pickupDuration = 30;
        juggler.add(this.onEnterFrame, this);
    }

    private onEnterFrame() {
        this.x += (this.targetPlayer.horizontalCenter - this.x) * 0.2;
        this.y += (this.targetPlayer.verticalCenter - this.y) * 0.2;
        this.alpha = this.pickupDuration / 30;
        this.pickupDuration --;
        if (this.pickupDuration < 0) {
            if (this.parent) this.parent.removeChild(this);
            juggler.remove(this.onEnterFrame, this);
            this.destroy();
        }
    }
}
