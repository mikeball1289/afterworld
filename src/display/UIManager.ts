import NPCText, { INPCLike } from "../display/NPCText";
import { controls, InputType, juggler } from "../root";
import World from "../world/World";
import InventoryUI from "./InventoryUI";
import PlayerHUD from "./PlayerHUD";
import StatUI from "./StatUI";

export default class UIManager {

    public static NUM_WORLD_LAYERS = 2;

    public worldLayer: PIXI.Container;
    public overlayLayer: PIXI.Container;

    public worldLayers: PIXI.Container[] = [];
    public npcText: NPCText;

    public inventoryUI: InventoryUI;
    public statUI: StatUI;
    public playerHud: PlayerHUD;
    private selectMenuContainer: PIXI.Container;

    constructor(private world: World) {
        this.worldLayer = new PIXI.Container();
        this.overlayLayer = new PIXI.Container();

        for (let i = 0; i < UIManager.NUM_WORLD_LAYERS; i ++) {
            this.worldLayers[i] = new PIXI.Container();
            this.worldLayer.addChild(this.worldLayers[i]);
        }

        this.playerHud = new PlayerHUD();
        this.overlayLayer.addChild(this.playerHud);

        this.npcText = new NPCText(world);
        this.npcText.pivot.set(this.npcText.width / 2, this.npcText.height / 2);
        this.npcText.position.set(world.screenWidth / 2, world.screenHeight / 2);
        this.overlayLayer.addChild(this.npcText);

        this.selectMenuContainer = new PIXI.Container();
        this.selectMenuContainer.alpha = 0.95;
        this.overlayLayer.addChild(this.selectMenuContainer);

        this.inventoryUI = new InventoryUI(world);
        this.inventoryUI.x = Math.round(world.screenWidth / 2 - this.inventoryUI.width / 2);
        this.inventoryUI.y = Math.round(world.screenHeight / 2 - this.inventoryUI.height / 2);

        this.statUI = new StatUI(world);
        this.statUI.x = this.inventoryUI.x;
        this.statUI.y = this.inventoryUI.y;

        this.selectMenuContainer.addChild(this.statUI);
        this.selectMenuContainer.addChild(this.inventoryUI);
        this.selectMenuContainer.visible = false;

        juggler.add(this.onEnterFrame, this);
    }

    public displayNPCText(npc: INPCLike) {
        if (this.selectMenuIsOpen()) this.closeSelectMenu();
        this.npcText.display(npc);
    }

    public hasInteractiveUI() {
        return this.npcText.isOpen() || this.selectMenuIsOpen();
    }

    public selectMenuIsOpen() {
        return this.selectMenuContainer.visible;
    }

    public openSelectMenu() {
        this.selectMenuContainer.visible = true;
    }

    public closeSelectMenu() {
        this.selectMenuContainer.visible = true;
    }

    public onEnterFrame() {
        if (!this.selectMenuIsOpen()) {
            if (!this.world.uiManager.hasInteractiveUI() && controls.hasLeadingEdge(InputType.INVENTORY)) {
                this.openSelectMenu();
            }
            return;
        }
    }

}
