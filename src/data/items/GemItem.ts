import Skill from "../Skill";
import InventoryItem from "./InventoryItem";

export default class GemItem extends InventoryItem {

    public static isGemItem(obj: any): obj is GemItem {
        return obj && obj.type === "gem_item";
    }
    private itemType = "gem_item";

    constructor(graphic: PIXI.Texture, name: string, public skill: Skill) {
        super(graphic, name, "Just a gem");
    }

}
