import World from "../world/World";
import EquipmentItem from "./EquipmentItem";

export default class WeaponItem extends EquipmentItem {
    constructor(graphic: PIXI.Texture,
                name: string,
                sheetName: string,
                description: string | ((world: World) => string),
                public range: number) {
        super(graphic, "weapon", name, sheetName, description);
    }
}
