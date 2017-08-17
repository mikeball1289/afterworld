import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import EquipmentItem from "./EquipmentItem";
import InventoryItem from "./InventoryItem";
import * as ItemFactory from "./ItemFactory";
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

    public inventoryItems: (InventoryItem | undefined)[] = [
        ItemFactory.constructItem("weapon", ItemFactory.itemData.heros_sword),
    ];
    public equipment: IEquipmentSlots = {
        head: undefined,
        neck: undefined,
        body: ItemFactory.constructItem("equip", ItemFactory.itemData.cloth_shirt),
        legs: ItemFactory.constructItem("equip", ItemFactory.itemData.leather_pants),
        feet: ItemFactory.constructItem("equip", ItemFactory.itemData.leather_boots),
        trinket: undefined,
        weapon: ItemFactory.constructItem("weapon", ItemFactory.itemData.iron_dagger),
        offhand: undefined,
        gloves: undefined,
    };

    constructor(private world: World) { }

    public addItem(item: InventoryItem) {
        for (let i = 0; i < Inventory.INVENTORY_SIZE; i ++) {
            if (this.inventoryItems[i] === undefined) {
                this.inventoryItems[i] = item;
                return true;
            }
        }
        return false;
    }

}
