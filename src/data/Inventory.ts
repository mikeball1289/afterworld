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
        ItemFactory.constructItem("weapon", ItemFactory.itemData.iron_dagger),
    ];
    public equipment: IEquipmentSlots = {
        head: undefined,
        neck: undefined,
        body: ItemFactory.constructItem("equip", ItemFactory.itemData.cloth_shirt),
        legs: ItemFactory.constructItem("equip", ItemFactory.itemData.leather_pants),
        feet: ItemFactory.constructItem("equip", ItemFactory.itemData.leather_boots),
        trinket: undefined,
        weapon: undefined,
        offhand: undefined,
        gloves: undefined,
    };

    constructor(private world: World) { }

    public addItem(item: InventoryItem) {
        for (let i = 0; i < Inventory.INVENTORY_SIZE; i ++) {
            if (this.inventoryItems[i] === undefined) {
                this.inventoryItems[i] = item;
                this.world.uiManager.inventoryUI.refreshInventoryIcons();
                return true;
            }
        }
        return false;
    }

    public removeItem(index: number): InventoryItem | undefined;
    public removeItem(item: InventoryItem): InventoryItem | undefined;
    public removeItem(search: (item: InventoryItem) => boolean): InventoryItem | undefined;
    public removeItem(i: number | InventoryItem | ((item: InventoryItem) => boolean)) {
        if (typeof i === "number") {
            let item = this.inventoryItems[i];
            this.inventoryItems[i] = undefined;
            this.world.uiManager.inventoryUI.refreshInventoryIcons();
            return item;
        } else if (typeof i === "function") {
            for (let idx = 0; idx < this.inventoryItems.length; idx ++) {
                let item = this.inventoryItems[idx];
                if (!item) continue;
                if (i(item)) return this.removeItem(idx);
            }
            return undefined;
        } else {
            let idx = this.inventoryItems.indexOf(i);
            if (idx < 0) return undefined;
            return this.removeItem(idx);
        }
    }

    public hasSpace() {
        return this.inventoryItems.length < Inventory.INVENTORY_SIZE || this.inventoryItems.indexOf(undefined) >= 0;
    }

}
