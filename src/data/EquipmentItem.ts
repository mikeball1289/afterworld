import Player from "../actors/Player";
import World from "../world/World";
import { IEquipmentSlots } from "./Inventory";
import InventoryItem from "./InventoryItem";

type EquipmentType = keyof IEquipmentSlots;

const SPRITE_ASSET_ROOT = "/sprites/";

export default class EquipmentItem extends InventoryItem {

    public static isEquipmentItem(obj: any): obj is EquipmentItem {
        return obj && obj.type === "equipment";
    }

    constructor(graphic: PIXI.Texture, public equipmentType: EquipmentType, name: string, public sheetName: string, description: string | ((world: World) => string)) {
        super(graphic, name, description);
        this.type = "equipment";
    }

    public addEquipmentGraphic(player: Player) {
        switch (this.equipmentType) {
            case "head": {
                player.body.head.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_head.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_head.json");
                break;
            }
            case "body": {
                player.body.body.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_body.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_body.json");
                player.body.front_arm.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_front_arm.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_front_arm.json");
                break;
            }
            case "legs": {
                player.body.legs.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_legs.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_legs.json");
                break;
            }
            case "feet": {
                player.body.feet.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_feet.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_feet.json");
                break;
            }
            case "weapon": {
                player.body.weapon.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_weapon.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_weapon.json");
                break;
            }
            case "gloves": {
                player.body.front_hand.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_front_hand.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_front_hand.json");
                player.body.back_hand.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_back_hand.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_back_hand.json");
                break;
            }
            case "offhand":
            default: break;
        }
    }
}
