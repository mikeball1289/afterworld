import World from "../world/World";
import { IEquipmentSlots } from "./Inventory";
import InventoryItem from "./InventoryItem";

type EquipmentType = keyof IEquipmentSlots;

export default class EquipmentItem extends InventoryItem {

    constructor(graphic: PIXI.Texture, public equipmentType: EquipmentType, name: string, description: string | ((world: World) => string)) {
        super(graphic, name, description);
        this.type = "equipment";
    }
}
