import NPCText from "../display/NPCText";
import World from "../world/World";
import InventoryUI from "./InventoryUI";

export default class UIManager {

    public static NUM_WORLD_LAYERS = 2;

    public worldLayer: PIXI.Container;
    public overlayLayer: PIXI.Container;

    public worldLayers: PIXI.Container[] = [];
    public npcText: NPCText;

    constructor(private world: World) {
        this.worldLayer = new PIXI.Container();
        this.overlayLayer = new PIXI.Container();

        for (let i = 0; i < UIManager.NUM_WORLD_LAYERS; i ++) {
            this.worldLayers[i] = new PIXI.Container();
            this.worldLayer.addChild(this.worldLayers[i]);
        }

        this.npcText = new NPCText(world);
        this.npcText.pivot.set(this.npcText.width / 2, this.npcText.height / 2);
        this.npcText.position.set(world.screenWidth / 2, world.screenHeight / 2);
        this.overlayLayer.addChild(this.npcText);

        let inventory = new InventoryUI(world);
        inventory.alpha = 0.95;
        inventory.x = Math.round(world.screenWidth / 2 - inventory.width / 2);
        inventory.y = Math.round(world.screenHeight / 2 - inventory.height / 2);
        // this.overlayLayer.addChild(inventory);
    }

    public hasInteractiveUI() {
        return this.npcText.isOpen();
    }

}
