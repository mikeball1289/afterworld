import {fromTextureCache} from "../../pixiTools";
import {Skill} from "../Skill";
import {InventoryItem} from "./InventoryItem";

export type GemColor = "red" | "blue" | "black";

export class GemItem extends InventoryItem {

    public static isGemItem(obj: any): obj is GemItem {
        return obj && obj.itemType === "gem_item";
    }
    private itemType = "gem_item";

    constructor(graphic: PIXI.Texture, name: string, public color: GemColor, public skill?: Skill) {
        super(graphic, name, "");
    }

    public socketTexture() {
        switch (this.color) {
            case "red": return fromTextureCache("/images/inventory_ui.png", 155, 501, 40, 40);
            case "blue": return fromTextureCache("/images/inventory_ui.png", 205, 501, 40, 40);
            case "black": return fromTextureCache("/images/inventory_ui.png", 255, 501, 40, 40);
            default: return PIXI.Texture.EMPTY;
        }
    }

    public getDescription() {
        if (this.skill) {
            return this.skill.getName() + " - " + this.skill.getDescription();
        } else {
            return "There doesn't appear to be anything special about this gem.";
        }
    }

}
