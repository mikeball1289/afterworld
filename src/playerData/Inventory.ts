import EquipmentItem from "./EquipmentItem";
import InventoryItem from "./InventoryItem";

export interface IEquipmentSlots {
    head: EquipmentItem | undefined;
    neck: EquipmentItem | undefined;
    body: EquipmentItem | undefined;
    legs: EquipmentItem | undefined;
    feet: EquipmentItem | undefined;
    trinket: EquipmentItem | undefined;
    weapon: EquipmentItem | undefined;
    offhand: EquipmentItem | undefined;
    gloves: EquipmentItem | undefined;
}

export default class Inventory {
    public static INVENTORY_SIZE = 36;

    public inventoryItems: (InventoryItem | undefined)[] = [];
    public equipment: IEquipmentSlots = {
        head: undefined,
        neck: undefined,
        body: undefined,
        legs: undefined,
        feet: undefined,
        trinket: undefined,
        weapon: undefined,
        offhand: undefined,
        gloves: undefined,
    };
}
