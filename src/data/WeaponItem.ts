import World from "../world/World";
import EquipmentItem from "./EquipmentItem";

export type WeaponType = "heavy" | "light" | "magic";

export default class WeaponItem extends EquipmentItem {
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
}
