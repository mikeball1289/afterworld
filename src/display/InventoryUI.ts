import { IEquipmentSlots } from "../data/Inventory";
import Inventory from "../data/Inventory";
import EquipmentItem from "../data/items/EquipmentItem";
import JuggledSprite from "../display/JuggledSprite";
import { fromTextureCache } from "../pixiTools";
import { controls, InputType } from "../root";
import World from "../world/World";
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

type SelectionArea = "items" | "equipment" | "skills";

export default class InventoryUI extends JuggledSprite {

    public selection: {
        area: SelectionArea;
        index: number;
    } = { area: "items", index: 0 };
    private selectionHighlight: PIXI.Sprite;
    private moveHighlight: PIXI.Sprite;
    private itemTextures: PIXI.Container;
    private optionBox: OptionBox;
    private moveMode = false;
    private moveIndex = 0;

    constructor(private world: World) {
        super(fromTextureCache("/images/inventory_ui.png", 0, 0, 871, 496));
        this.optionBox = new OptionBox();
        this.alpha = 0.95;
        this.visible = false;
        this.moveHighlight = new PIXI.Sprite(fromTextureCache("/images/inventory_ui.png", 50, 496, 50, 50));
        this.moveHighlight.visible = false;
        this.selectionHighlight = new PIXI.Sprite(fromTextureCache("/images/inventory_ui.png", 0, 496, 50, 50));
        this.itemTextures = new PIXI.Container();
        this.addChild(this.itemTextures);
        this.addChild(this.moveHighlight);
        this.addChild(this.selectionHighlight);
        this.addChild(this.optionBox);
        this.highlightSelection();
    }

    public onEnterFrame() {
        if (!this.isOpen()) {
            if (!this.world.uiManager.hasInteractiveUI() && controls.hasLeadingEdge(InputType.INVENTORY)) {
                this.open();
            }
            return;
        }
        if (this.optionBox.isOpen()) {
            return;
        }

        // everything past this point has the inventory open and no optionbox
        if (controls.hasLeadingEdge(InputType.INVENTORY) || (!this.moveMode && controls.hasLeadingEdge(InputType.CANCEL))) {
            this.close();
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
        } else if (controls.hasLeadingEdge(InputType.CONFIRM)) {
            let inventory = this.world.actorManager.player.inventory;
            if (this.moveMode) {
                this.moveMode = false;
                this.moveHighlight.visible = false;
                let item = inventory.inventoryItems[this.moveIndex];
                inventory.inventoryItems[this.moveIndex] = inventory.inventoryItems[this.selection.index];
                inventory.inventoryItems[this.selection.index] = item;
                this.refreshInventoryIcons();
                return;
            }

            let p = this.getItemFrameCoords(this.selection);
            this.optionBox.x = p[0] + 52;
            this.optionBox.y = p[1] + 30;
            if (this.selection.area === "equipment") {
                let equip = inventory.equipment[EQUIPMENT_INDEX_TYPES[this.selection.index]];
                if (!equip) return;
                this.optionBox.open(["Unequip", "Cancel"], (option) => {
                    if (option === 0 && equip) {
                        if (inventory.addItem(equip)) {
                            inventory.equipment[EQUIPMENT_INDEX_TYPES[this.selection.index]] = undefined;
                            this.world.actorManager.player.unsetEquipmentGraphic(EQUIPMENT_INDEX_TYPES[this.selection.index]);
                            this.refreshInventoryIcons();
                        }
                    }
                } );
            } else if (this.selection.area === "items") {
                let item = inventory.inventoryItems[this.selection.index];
                if (!item) return;
                if (EquipmentItem.isEquipmentItem(item)) {
                    this.optionBox.open(["Equip", "Move", "Drop", "Cancel"], (option) => {
                        if (!(item && EquipmentItem.isEquipmentItem(item))) return;
                        if (option === 0) {
                            let oldItem = inventory.equipment[item.equipmentType];
                            inventory.equipment[item.equipmentType] = item;
                            inventory.inventoryItems[this.selection.index] = oldItem;
                            item.addEquipmentGraphic(this.world.actorManager.player);
                            this.refreshInventoryIcons();
                        } else if (option === 1) {
                            this.moveMode = true;
                            this.moveIndex = this.selection.index;
                            this.moveHighlight.visible = true;
                            this.moveHighlight.x = p[0];
                            this.moveHighlight.y = p[1];
                        }/* else if (option === 2) {
                            
                        }*/
                    } );
                }
            }

        }
    }

    public isOpen() {
        return this.visible;
    }

    public open() {
        this.visible = true;
    }

    public close() {
        this.visible = false;
    }

    public setSelection(index: number, area?: SelectionArea) {
        this.selection.index = index;
        if (area) this.selection.area = area;
        this.highlightSelection();
    }

    public refreshInventoryIcons() {
        this.itemTextures.removeChildren();
        let inventory = this.world.actorManager.player.inventory;
        for (let i = 0; i < Inventory.INVENTORY_SIZE; i ++) {
            let item = inventory.inventoryItems[i];
            if (!item) continue;
            let sprite = new PIXI.Sprite(item.graphic);
            let coords = this.getItemFrameCoords({ area: "items", index: i });
            sprite.x = coords[0] + 5;
            sprite.y = coords[1] + 5;
            this.itemTextures.addChild(sprite);
        }

        for (let i = 0; i < EQUIPMENT_INDEX_TYPES.length; i ++) {
            let item = inventory.equipment[EQUIPMENT_INDEX_TYPES[i]];
            if (!item) continue;
            let sprite = new PIXI.Sprite(item.graphic);
            let coords = this.getItemFrameCoords({ area: "equipment", index: i });
            sprite.x = coords[0] + 5;
            sprite.y = coords[1] + 5;
            this.itemTextures.addChild(sprite);
        }
    }

    public moveSelection(direction: MovementDirection) {
        if (this.selection.area === "items") {
            switch (direction) {
                case MovementDirection.UP: {
                    if (Math.floor(this.selection.index / 6) > 0) {
                        this.setSelection(this.selection.index - 6);
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
        }
    }

    private highlightSelection() {
        [this.selectionHighlight.x, this.selectionHighlight.y] = this.getItemFrameCoords(this.selection);
    }

    private getItemFrameCoords(selection: { area: SelectionArea, index: number }): [number, number] {
        if (selection.area === "items") {
            return [244 + (selection.index % 6) * 52, 108 + Math.floor(selection.index / 6) * 52];
        } else if (selection.area === "equipment") {
            if (selection.index < 2) {
                return [44, 264 + selection.index * 52];
            } else if (selection.index < 7) {
                return [98, 149 + (selection.index - 2) * 52];
            } else {
                return [151, 271 + (selection.index - 7) * 52];
            }
        }
        return [0, 0];
    }
}
