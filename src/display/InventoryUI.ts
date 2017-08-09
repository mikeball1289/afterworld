import World from "../world/World";

export default class InventoryUI extends PIXI.Sprite {

    constructor(private world: World) {
        super(PIXI.loader.resources["/images/inventory_ui.png"].texture);
        this.alpha = 0.95;
    }
}
