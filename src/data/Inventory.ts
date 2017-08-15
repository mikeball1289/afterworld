import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import EquipmentItem from "./EquipmentItem";
import InventoryItem from "./InventoryItem";
import WeaponItem from "./WeaponItem";

export interface IEquipmentSlots {
    head: EquipmentItem | undefined;
    neck: EquipmentItem | undefined;
    body: EquipmentItem | undefined;
    legs: EquipmentItem | undefined;
    feet: EquipmentItem | undefined;
    trinket: EquipmentItem | undefined;
    weapon: WeaponItem | undefined;
    offhand: EquipmentItem | undefined;
    gloves: EquipmentItem | undefined;
}

export default class Inventory {
    public static INVENTORY_SIZE = 36;

    public inventoryItems: (InventoryItem | undefined)[] = [];
    public equipment: IEquipmentSlots = {
        head: undefined,
        neck: undefined,
        body: new EquipmentItem(fromTextureCache("/images/item_sheet.png", 0, 0, 40, 40),
                                    "body", "Cloth Shirt", "cloth_shirt", "A simple cloth shirt"),
        legs: undefined,
        feet: undefined,
        trinket: undefined,
        weapon: new WeaponItem(fromTextureCache("/images/item_sheet.png", 40, 0, 40, 40), "Iron Dagger", "iron_dagger", "A simple iron dagger", 40),
        offhand: undefined,
        gloves: undefined,
    };

    constructor(private world: World) { }
}
