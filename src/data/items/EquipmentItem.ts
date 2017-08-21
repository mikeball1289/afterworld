import Player from "../../actors/Player";
import World from "../../world/World";
import { IEquipmentSlots } from "../Inventory";
import GemItem from "./GemItem";
import InventoryItem from "./InventoryItem";

type EquipmentType = keyof IEquipmentSlots;

const SPRITE_ASSET_ROOT = "/sprites/";

export default class EquipmentItem extends InventoryItem {

    public static isEquipmentItem(obj: any): obj is EquipmentItem {
        return obj && obj.type === "equipment";
    }

    public ilvl: number = 0;

    public socket?: {
        gem?: GemItem;
    } = undefined;

    constructor(graphic: PIXI.Texture, public equipmentType: EquipmentType, name: string, public sheetName: string, description: string | ((world: World) => string)) {
        super(graphic, name, description);
        this.type = "equipment";
    }

    public generate(level: number) {
        this.ilvl = level;
        return this;
    }

    public get gem() {
        if (this.socket) return this.socket.gem;
        return undefined;
    }

    public getDescription(world: World) {
        return "LV " + this.ilvl + "\n" + super.getDescription(world);
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
            case "offhand": {
                player.body.offhand_front.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_offhand_front.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_offhand_front.json");
                player.body.offhand_back.loadTexturePackerFrames(SPRITE_ASSET_ROOT + this.sheetName + "_offhand_back.png",
                                                         SPRITE_ASSET_ROOT + this.sheetName + "_offhand_back.json");
                break;
            }
            default: break;
        }
    }
}
