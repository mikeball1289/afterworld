import { IEquipmentSlots } from "../data/Inventory";
import Inventory from "../data/Inventory";
import EquipmentItem from "../data/items/EquipmentItem";
import GemItem from "../data/items/GemItem";
import InventoryItem from "../data/items/InventoryItem";
import { NUM_SKILLS } from "../data/Skillbar";
import JuggledSprite from "../display/JuggledSprite";
import { fromTextureCache } from "../pixiTools";
import { controls, InputType } from "../root";
import World from "../world/World";
import WorldItem from "../world/worldobjects/WorldItem";
import OptionBox from "./widgets/OptionBox";

enum MovementDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

const EQUIPMENT_INDEX_TYPES: (keyof IEquipmentSlots)[] = [
    "trinket",
    "weapon",
    "head",
    "neck",
    "body",
    "legs",
    "feet",
    "offhand",
    "gloves",
];

const SKILLBAR_INDEX_MAPPING = [2, 3, 4, 5, 0, 1];

type Mode = "normal" | "move" | "socket";
type SelectionArea = "items" | "equipment" | "skills";

export default class InventoryUI extends JuggledSprite {

    public static getItemFrameCoords(selection: { area: SelectionArea, index: number }): [number, number] {
        if (selection.area === "items") {
            return [244 + (selection.index % 6) * 52, 148 + Math.floor(selection.index / 6) * 52];
        } else if (selection.area === "equipment") {
            if (selection.index < 2) {
                return [44, 304 + selection.index * 52];
            } else if (selection.index < 7) {
                return [98, 189 + (selection.index - 2) * 52];
            } else {
                return [151, 311 + (selection.index - 7) * 52];
            }
        } else if (selection.area === "skills") {
            return [125 + 52 * selection.index + (selection.index >= 4 ? 30 : 0), 66];
        }
        return [0, 0];
    }

    public selection: {
        area: SelectionArea;
        index: number;
    } = { area: "items", index: 0 };
    private selectionHighlight: PIXI.Sprite;
    private moveHighlight: PIXI.Sprite;
    private itemTextures: PIXI.Container;
    private optionBox: OptionBox;
    private mode: Mode = "normal";
    private moveIndex = 0;
    private titleText: PIXI.Text;
    private descriptionText: PIXI.Text;
    private descriptionPanel: PIXI.Container;
    private socketTextures: PIXI.Texture[];
    private socketHighlight: PIXI.Sprite;
    private selectedGem?: GemItem;

    private get moveMode() {
        return this.mode === "move";
    }
    private set moveMode(val) {
        if (val) this.mode = "move";
        else this.mode = "normal";
    }

    private get socketMode() {
        return this.mode === "socket";
    }
    private set socketMode(val) {
        if (val) this.mode = "socket";
        else this.mode = "normal";
    }

    constructor(private world: World) {
        super(fromTextureCache("/images/inventory_ui.png", 0, 0, 871, 496));
        this.optionBox = new OptionBox();
        this.moveHighlight = new PIXI.Sprite(fromTextureCache("/images/inventory_ui.png", 50, 496, 50, 50));
        this.moveHighlight.visible = false;
        this.socketTextures = [fromTextureCache("/images/inventory_ui.png", 300, 496, 50, 50), fromTextureCache("/images/inventory_ui.png", 350, 496, 50, 50)];
        this.socketHighlight = new PIXI.Sprite(this.socketTextures[0]);
        this.socketHighlight.visible = false;
        this.selectionHighlight = new PIXI.Sprite(fromTextureCache("/images/inventory_ui.png", 0, 496, 50, 50));
        this.itemTextures = new PIXI.Container();
        this.highlightSelection();

        this.descriptionPanel = new PIXI.Container();
        this.descriptionPanel.x = 576;
        this.descriptionPanel.y = 70;
        this.titleText = new PIXI.Text("", {
            fontFamily: DEFAULT_FONT,
            fontSize: 24,
            wordWrap: true,
            wordWrapWidth: 294,
        } );
        this.titleText.y = 4;
        this.descriptionPanel.addChild(this.titleText);

        this.descriptionText = new MultiStyleText("", {
            default: {
                fontFamily: DEFAULT_FONT,
                fontSize: 14,
                wordWrap: true,
                wordWrapWidth: 291,
            },
            red: {
                fill: 0xFF0000,
            },
            green: {
                fill: 0x00FF00,
            },
            or: {
                fill: 0xFF9000,
            },
            cyan: {
                fill: 0x00FF8F,
            },
            darkGreen: {
                fill: 0x00CC00,
            },
            blue: {
                fill: 0x0000FF,
            },
        } );
        this.descriptionText.y = 5;
        this.descriptionPanel.addChild(this.descriptionText);

        this.addChild(this.itemTextures);
        this.addChild(this.moveHighlight);
        this.addChild(this.selectionHighlight);
        this.addChild(this.socketHighlight);
        this.addChild(this.descriptionPanel);
        this.addChild(this.optionBox);
    }

    public onEnterFrame() {
        if (!this.isOpen) return;
        if (this.optionBox.isOpen()) {
            return;
        }

        if (controls.hasLeadingEdge(InputType.UP)) {
            this.moveSelection(MovementDirection.UP);
        } else if (controls.hasLeadingEdge(InputType.DOWN)) {
            this.moveSelection(MovementDirection.DOWN);
        } else if (controls.hasLeadingEdge(InputType.LEFT)) {
            this.moveSelection(MovementDirection.LEFT);
        } else if (controls.hasLeadingEdge(InputType.RIGHT)) {
            this.moveSelection(MovementDirection.RIGHT);
        } else if (controls.hasLeadingEdge(InputType.CANCEL) && this.moveMode) {
            this.moveMode = false;
            this.moveHighlight.visible = false;
        } else if (controls.hasLeadingEdge(InputType.CANCEL) && this.socketMode) {
            this.socketMode = false;
            this.socketHighlight.visible = false;
            this.moveHighlight.visible = false;
            this.selectionHighlight.visible = true;
            this.highlightSelection();
        } else if (controls.hasLeadingEdge(InputType.CANCEL)) {
            this.close();
        } else if (controls.hasLeadingEdge(InputType.CONFIRM)) {
            this.select();
        }
    }

    private get isOnTop() {
        return this.parent.getChildIndex(this) === this.parent.children.length - 1;
    }

    public bringToFront() {
        this.showDescription();
        this.parent.setChildIndex(this, this.parent.children.length - 1);
    }

    public cleanup() {
        this.optionBox.close();
        this.selectionHighlight.visible = true;
        this.socketHighlight.visible = false;
        this.moveHighlight.visible = false;
        this.mode = "normal";
        this.highlightSelection();
    }

    public close() {
        this.world.uiManager.closeSelectMenu();
    }

    public get isOpen() {
        return this.isOnTop && this.world.uiManager.selectMenuIsOpen();
    }

    public setSelection(index: number, area?: SelectionArea) {
        this.selection.index = index;
        if (area) this.selection.area = area;
        this.highlightSelection();
    }

    public refreshInventoryIcons(excludeInventory = false) {
        this.itemTextures.removeChildren();
        let inventory = this.world.actorManager.player.inventory;
        if (!excludeInventory) {
            for (let i = 0; i < Inventory.INVENTORY_SIZE; i ++) {
                let item = inventory.inventoryItems[i];
                if (!item) continue;
                let sprite = new PIXI.Sprite(item.graphic);
                if (EquipmentItem.isEquipmentItem(item)) {
                    if (item.socket) {
                        if (item.socket.gem) {
                            sprite.addChild(new PIXI.Sprite(item.socket.gem.socketTexture()));
                        } else {
                            sprite.addChild(new PIXI.Sprite(fromTextureCache("/images/inventory_ui.png", 105, 501, 40, 40)));
                        }
                    }
                }
                let coords = InventoryUI.getItemFrameCoords({ area: "items", index: i });
                sprite.x = coords[0] + 5;
                sprite.y = coords[1] + 5;
                this.itemTextures.addChild(sprite);
            }
        }

        for (let i = 0; i < EQUIPMENT_INDEX_TYPES.length; i ++) {
            let item = inventory.equipment[EQUIPMENT_INDEX_TYPES[i]];
            if (!item) continue;
            let sprite = new PIXI.Sprite(item.graphic);
            if (item.socket) {
                if (item.socket.gem) {
                    sprite.addChild(new PIXI.Sprite(item.socket.gem.socketTexture()));
                } else {
                    sprite.addChild(new PIXI.Sprite(fromTextureCache("/images/inventory_ui.png", 105, 501, 40, 40)));
                }
            }
            let coords = InventoryUI.getItemFrameCoords({ area: "equipment", index: i });
            sprite.x = coords[0] + 5;
            sprite.y = coords[1] + 5;
            this.itemTextures.addChild(sprite);
        }

        let skills = this.world.actorManager.player.skillBar.equippedSkills;
        for (let i = 0; i < NUM_SKILLS; i ++) {
            let skill = skills[SKILLBAR_INDEX_MAPPING[i]];
            if (skill === undefined) continue;
            let sprite = new PIXI.Sprite(skill.icon);
            let coords = InventoryUI.getItemFrameCoords({ area: "skills", index: i });
            sprite.x = coords[0];
            sprite.y = coords[1];
            this.itemTextures.addChild(sprite);
        }
    }

    public showDescription() {
        let player = this.world.actorManager.player;
        this.titleText.text = "";
        this.descriptionText.text = "";
        if (this.selection.area === "items") {
            let item = player.inventory.inventoryItems[this.selection.index];
            if (item) {
                this.titleText.text = item.getName();
                this.descriptionText.text = item.getDescription(this.world);
            }
        } else if (this.selection.area === "equipment") {
            let equipment = player.inventory.equipment[EQUIPMENT_INDEX_TYPES[this.selection.index]];
            if (equipment) {
                this.titleText.text = equipment.getName();
                this.descriptionText.text = equipment.getDescription(this.world);
            }
        } else if (this.selection.area === "skills") {
            let skill = player.skillBar.equippedSkills[SKILLBAR_INDEX_MAPPING[this.selection.index]];
            if (skill) {
                this.titleText.text = skill.getName();
                this.descriptionText.text = skill.getDescription();
            }
        }
        this.descriptionText.y = this.titleText.height + 6;
    }

    public moveSelection(direction: MovementDirection) {
        if (this.selection.area === "items") {
            switch (direction) {
                case MovementDirection.UP: {
                    if (Math.floor(this.selection.index / 6) > 0) {
                        this.setSelection(this.selection.index - 6);
                    } else if (!this.moveMode && !this.socketMode) {
                        this.setSelection(this.selection.index, "skills");
                    }
                    break;
                }
                case MovementDirection.DOWN: {
                    if (Math.floor(this.selection.index / 6) < 5) {
                        this.setSelection(this.selection.index + 6);
                    }
                    break;
                }
                case MovementDirection.LEFT: {
                    if (this.selection.index % 6 > 0) {
                        this.setSelection(this.selection.index - 1);
                    } else if (!this.moveMode) {
                        this.setSelection(7, "equipment");
                    }
                    break;
                }
                case MovementDirection.RIGHT: {
                    if (this.selection.index % 6 < 5) {
                        this.setSelection(this.selection.index + 1);
                    }
                    break;
                }
                default: break;
            }
        } else if (this.selection.area === "equipment") {
            if (direction === MovementDirection.UP) {
                if (this.selection.index !== 0 && this.selection.index !== 2 && this.selection.index !== 7) {
                    this.setSelection(this.selection.index - 1);
                } else if (this.selection.index === 2 && !this.socketMode) {
                    this.setSelection(0, "skills");
                }
            } else if (direction === MovementDirection.DOWN) {
                if (this.selection.index !== 1 && this.selection.index !== 6 && this.selection.index !== 8) {
                    this.setSelection(this.selection.index + 1);
                }
            } else if (direction === MovementDirection.LEFT) {
                if (this.selection.index >= 2 && this.selection.index < 7) {
                    this.setSelection(0 + (this.selection.index >= 5 ? 1 : 0));
                } else if (this.selection.index >= 7) {
                    this.setSelection(4 + (this.selection.index === 8 ? 1 : 0));
                }
            } else if (direction === MovementDirection.RIGHT) {
                if (this.selection.index < 2) {
                    this.setSelection(4 + this.selection.index);
                } else if (this.selection.index >= 2 && this.selection.index < 7) {
                    this.setSelection(7 + (this.selection.index >= 5 ? 1 : 0));
                } else {
                    this.setSelection(0, "items");
                }
            }
        } else if (this.selection.area === "skills") {
            if (direction === MovementDirection.LEFT) {
                if (this.selection.index > 0) this.setSelection(this.selection.index - 1);
            } else if (direction === MovementDirection.RIGHT) {
                if (this.selection.index < 5) this.setSelection(this.selection.index + 1);
            } else if (direction === MovementDirection.DOWN && !this.moveMode) {
                this.setSelection(this.selection.index, "items");
            }
        }
        this.showDescription();
    }

    private highlightSelection() {
        if (!this.socketMode) {
            [this.selectionHighlight.x, this.selectionHighlight.y] = InventoryUI.getItemFrameCoords(this.selection);
        } else {
            [this.socketHighlight.x, this.socketHighlight.y] = InventoryUI.getItemFrameCoords(this.selection);
            let item = this.selectedItem();
            if (item && EquipmentItem.isEquipmentItem(item) && item.canAddGem()) {
                this.socketHighlight.texture = this.socketTextures[0];
            } else {
                this.socketHighlight.texture = this.socketTextures[1];
            }
        }
    }

    private selectedItem() {
        let inventory = this.world.actorManager.player.inventory;
        if (this.selection.area === "items") {
            return inventory.inventoryItems[this.selection.index];
        } else if (this.selection.area === "equipment") {
            return inventory.equipment[EQUIPMENT_INDEX_TYPES[this.selection.index]];
        }
        return undefined;
    }

    private select() {
        let inventory = this.world.actorManager.player.inventory;
        if (this.moveMode) {
            this.moveMode = false;
            this.moveHighlight.visible = false;
            if (this.selection.area === "items") {
                let item = inventory.inventoryItems[this.moveIndex];
                inventory.inventoryItems[this.moveIndex] = inventory.inventoryItems[this.selection.index];
                inventory.inventoryItems[this.selection.index] = item;
            } else if (this.selection.area === "skills") {
                let skillbar = this.world.actorManager.player.skillBar;
                skillbar.swapSkills(SKILLBAR_INDEX_MAPPING[this.moveIndex], SKILLBAR_INDEX_MAPPING[this.selection.index]);
            }
            this.refreshInventoryIcons();
            return;
        } else if (this.socketMode) {
            let item = this.selectedItem();
            if (item && EquipmentItem.isEquipmentItem(item)) {
                if (this.selectedGem && item.canAddGem()) {
                    if (inventory.removeItem(this.selectedGem)) {
                        item.addGem(this.selectedGem);
                        if (this.selection.area === "equipment") {
                            if (this.selectedGem.skill) {
                                this.world.actorManager.player.skillBar.addSkill(this.selectedGem.skill);
                            }
                        }
                    }
                    this.socketMode = false;
                    this.selectedGem = undefined;
                    this.socketHighlight.visible = false;
                    this.moveHighlight.visible = false;
                    this.selectionHighlight.visible = true;
                    this.refreshInventoryIcons();
                    this.highlightSelection();
                    this.showDescription();
                }
            }
            return;
        }

        let p = InventoryUI.getItemFrameCoords(this.selection);
        this.optionBox.x = p[0] + 52;
        this.optionBox.y = p[1] + 30;
        if (this.selection.area === "equipment") {
            let equip = inventory.equipment[EQUIPMENT_INDEX_TYPES[this.selection.index]];
            if (!equip) return;
            this.optionBox.open(["Unequip", "Cancel"], (option) => {
                if (option === 0 && equip) {
                    inventory.unequip(EQUIPMENT_INDEX_TYPES[this.selection.index]);
                    this.refreshInventoryIcons();
                }
            } );
        } else if (this.selection.area === "items") {
            let item = inventory.inventoryItems[this.selection.index];
            if (!item) return;
            if (EquipmentItem.isEquipmentItem(item)) {
                this.optionBox.open(["Equip", "Move", "Drop", "Cancel"], (option) => {
                    if (!(item && EquipmentItem.isEquipmentItem(item))) return;
                    if (option === 0) {
                        inventory.equipItem(this.selection.index);
                        this.refreshInventoryIcons();
                        this.showDescription();
                    } else if (option === 1) {
                        this.beginMove(p);
                    } else if (option === 2) {
                        this.dropItem();
                    }
                } );
            } else if (GemItem.isGemItem(item)) {
                this.optionBox.open(["Socket", "Move", "Drop", "Cancel"], (option) => {
                    if (!(item && GemItem.isGemItem(item))) return;
                    if (option === 0) {
                        this.socketMode = true;
                        this.selectedGem = item;
                        this.socketHighlight.visible = true;
                        this.moveHighlight.visible = true;
                        this.selectionHighlight.visible = false;
                        [this.moveHighlight.x, this.moveHighlight.y] = InventoryUI.getItemFrameCoords(this.selection);
                        this.highlightSelection();
                    } else if (option === 1) {
                        this.beginMove(p);
                    } else if (option === 2) {
                        this.dropItem();
                    }
                } );
            } else {
                this.optionBox.open(["Move", "Drop", "Cancel"], (option) => {
                    if (!(item)) return;
                    if (option === 0) {
                        this.beginMove(p);
                    } else if (option === 1) {
                        this.dropItem();
                    }
                } );
            }
        } else if (this.selection.area === "skills") {
            let skill = this.world.actorManager.player.skillBar.equippedSkills[SKILLBAR_INDEX_MAPPING[this.selection.index]];
            if (!skill) return;
            this.optionBox.open(["Move", "Cancel"], (option) => {
                if (!skill) return;
                if (option === 0) {
                    this.beginMove(p);
                }
            } );
        }
    }

    private beginMove(frameCoords: [number, number]) {
        this.moveMode = true;
        this.moveIndex = this.selection.index;
        this.moveHighlight.visible = true;
        this.moveHighlight.x = frameCoords[0];
        this.moveHighlight.y = frameCoords[1];
    }

    private dropItem() {
        let item = this.world.actorManager.player.inventory.removeItem(this.selection.index);
        if (!item) return;
        let worldItem = new WorldItem(item);
        worldItem.x = this.world.actorManager.player.horizontalCenter;
        worldItem.y = this.world.actorManager.player.verticalCenter;
        worldItem.velocity.y = -8;
        this.world.addWorldItem(worldItem);
        this.refreshInventoryIcons();
    }
}
