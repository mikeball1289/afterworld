import NPCText, { INPCLike } from "../display/NPCText";
import World from "../world/World";
import InventoryUI from "./InventoryUI";

export default class UIManager {

    public static NUM_WORLD_LAYERS = 2;

    public worldLayer: PIXI.Container;
    public overlayLayer: PIXI.Container;

    public worldLayers: PIXI.Container[] = [];
    public npcText: NPCText;

    public inventoryUI: InventoryUI;

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

        this.inventoryUI = new InventoryUI(world);
        this.inventoryUI.alpha = 0.95;
        this.inventoryUI.x = Math.round(world.screenWidth / 2 - this.inventoryUI.width / 2);
        this.inventoryUI.y = Math.round(world.screenHeight / 2 - this.inventoryUI.height / 2);
        this.overlayLayer.addChild(this.inventoryUI);
    }

    public displayNPCText(npc: INPCLike) {
        if (this.inventoryUI.isOpen()) this.inventoryUI.close();
        this.npcText.display(npc);
    }

    public hasInteractiveUI() {
        return this.npcText.isOpen() || this.inventoryUI.isOpen();
    }

}
