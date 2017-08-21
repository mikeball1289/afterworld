import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import EquipmentItem from "./items/EquipmentItem";
import InventoryItem from "./items/InventoryItem";
import * as ItemFactory from "./items/ItemFactory";
import WeaponItem from "./items/WeaponItem";

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
        ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe),
        ItemFactory.constructItem("equip", ItemFactory.itemData.wooden_buckler),
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
