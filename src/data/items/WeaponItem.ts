import {World} from "../../world/World";
import {Skill} from "../Skill";
import * as skillData from "../skillData";
import {EquipmentItem} from "./EquipmentItem";
import {GemItem} from "./GemItem";

export type WeaponType = "heavy" | "light" | "magic";

export class WeaponItem extends EquipmentItem {

    public static isWeaponItem(obj: any): obj is WeaponItem {
        return obj && obj.equipmentType === "weapon";
    }

    constructor(graphic: PIXI.Texture,
                name: string,
                sheetName: string,
                description: string | ((world: World) => string),
                public range: number,
                public weaponType: WeaponType) {
        super(graphic, "weapon", name, sheetName, description);
    }

    public get prettyType() {
        switch (this.weaponType) {
            case "light": return "Light Weapon";
            case "heavy": return "Heavy Weapon";
            case "magic": return "Magic Weapon";
            default: return "Weapon";
        }
    }
}
