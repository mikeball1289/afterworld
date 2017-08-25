import NPCText, { INPCLike } from "../display/NPCText";
import { controls, InputType, juggler, root } from "../root";
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
    private selectMenuBatchTexture: PIXI.RenderTexture;
    private selectMenuRenderTarget: PIXI.Sprite;

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

        this.inventoryUI = new InventoryUI(world);
        this.inventoryUI.x = Math.round(world.screenWidth / 2 - this.inventoryUI.width / 2);
        this.inventoryUI.y = Math.round(world.screenHeight / 2 - this.inventoryUI.height / 2);

        this.statUI = new StatUI(world);
        this.statUI.x = this.inventoryUI.x;
        this.statUI.y = this.inventoryUI.y;

        this.selectMenuContainer.addChild(this.statUI);
        this.selectMenuContainer.addChild(this.inventoryUI);

        this.selectMenuBatchTexture = PIXI.RenderTexture.create(root.app.view.width, root.app.view.height);
        this.selectMenuRenderTarget = new PIXI.Sprite(this.selectMenuBatchTexture);
        this.selectMenuRenderTarget.alpha = 0.95;
        this.selectMenuRenderTarget.visible = false;
        this.overlayLayer.addChild(this.selectMenuRenderTarget);

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
        return this.selectMenuRenderTarget.visible;
    }

    public openSelectMenu() {
        this.selectMenuRenderTarget.visible = true;
        this.inventoryUI.bringToFront();
        // this.statUI.bringToFront();
    }

    public closeSelectMenu() {
        this.selectMenuRenderTarget.visible = false;
        this.inventoryUI.cleanup();
    }

    public onEnterFrame() {
        if (!this.selectMenuIsOpen()) {
            if (!this.world.uiManager.hasInteractiveUI() && controls.hasLeadingEdge(InputType.INVENTORY)) {
                this.openSelectMenu();
            }
        } else {
            root.app.renderer.render(this.selectMenuContainer, this.selectMenuBatchTexture);
            if (controls.hasLeadingEdge(InputType.INVENTORY)) {
                this.closeSelectMenu();
            } else if (controls.hasLeadingEdge(InputType.TAB_LEFT)) {
                if (this.inventoryUI.isOpen) {
                    this.statUI.bringToFront();
                } else if (this.statUI.isOpen) {
                    this.inventoryUI.bringToFront();
                }
            } else if (controls.hasLeadingEdge(InputType.TAB_RIGHT)) {
                if (this.inventoryUI.isOpen) {
                    this.statUI.bringToFront();
                } else if (this.statUI.isOpen) {
                    this.inventoryUI.bringToFront();
                }
            }
        }
    }

}
