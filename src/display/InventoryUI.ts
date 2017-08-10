import { IEquipmentSlots } from "../data/Inventory";
import JuggledSprite from "../display/JuggledSprite";
import { controls, InputType } from "../root";
import World from "../world/World";

enum MovementDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

type SelectionArea = "items" | "equipment" | "skills";

export default class InventoryUI extends JuggledSprite {

    public selection: {
        area: SelectionArea;
        index: number;
    } = { area: "items", index: 0 };

    private equipmentIndexTypes: (keyof IEquipmentSlots)[] = [
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
    private selectionHighlight: PIXI.Sprite;

    constructor(private world: World) {
        super(new PIXI.Texture(PIXI.loader.resources["/images/inventory_ui.png"].texture.baseTexture, new PIXI.Rectangle(0, 0, 871, 496)));
        this.alpha = 0.95;
        this.visible = false;
        this.selectionHighlight = new PIXI.Sprite(new PIXI.Texture(PIXI.loader.resources["/images/inventory_ui.png"].texture.baseTexture,
                                                    new PIXI.Rectangle(0, 496, 50, 50)));
        this.addChild(this.selectionHighlight);
        this.highlightSelection();
    }

    public onEnterFrame() {
        if (!this.isOpen()) {
            console.log(controls.hasLeadingEdge(InputType.INVENTORY));
            if (!this.world.uiManager.hasInteractiveUI() && controls.hasLeadingEdge(InputType.INVENTORY)) {
                this.open();
            }
            return;
        }
        // everything past this point has the inventory open
        if (controls.hasLeadingEdge(InputType.INVENTORY) || controls.hasLeadingEdge(InputType.SECONDARY_ATTACK)) {
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
                    } else {
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
