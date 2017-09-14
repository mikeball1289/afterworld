import {fromTextureCache} from "../pixiTools";
import {World} from "../world/World";
import {WorldItem} from "../world/worldobjects/WorldItem";
import {EquipmentItem} from "./items/EquipmentItem";
import {GemItem} from "./items/GemItem";
import {InventoryItem} from "./items/InventoryItem";
import * as ItemFactory from "./items/ItemFactory";
import {WeaponItem} from "./items/WeaponItem";
import * as skillData from "./skillData";

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

export class Inventory {
    public static INVENTORY_SIZE = 36;

    public inventoryItems: (InventoryItem | undefined)[] = [
        ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe).fillStats(1, {
            physicalDamage: 3,
        } ).addInscription(skillData.pounce),
        ItemFactory.constructItem("weapon", ItemFactory.itemData.iron_dagger).fillStats(5, {
            physicalDamage: 6,
            haste: 100,
            attackSpeed: 10,
        } ).addInscription(skillData.ambush),
        ItemFactory.constructItem("weapon", ItemFactory.itemData.iron_dagger).fillStats(5, {
            physicalDamage: 6,
            haste: 100,
            attackSpeed: 10,
        } ).addInscription(skillData.quickStrike),
        ItemFactory.constructItem("gem", {
            type: "black",
            name: "Angelic Malachite",
            icon: p(7, 0),
            description: "",
            skill: skillData.ascention,
        } ),
        // ItemFactory.constructItem(, {
// 
        // } ),
    ];
    public equipment: IEquipmentSlots = {
        head: undefined,
        neck: undefined,
        body: ItemFactory.constructItem("equip", ItemFactory.itemData.cloth_shirt).fillStats(1, {
            armor: 3,
        } ).addSocket(),
        legs: ItemFactory.constructItem("equip", ItemFactory.itemData.leather_pants).fillStats(1, {
            armor: 2,
        } ),
        feet: ItemFactory.constructItem("equip", ItemFactory.itemData.leather_boots).fillStats(1, {
            armor: 1,
        } ),
        trinket: undefined,
        weapon: undefined,
        offhand: undefined,
        gloves: undefined,
    };

    constructor(private world: World) { }

    public addItem(item: InventoryItem) {
        for (let i of range(0, Inventory.INVENTORY_SIZE)) {
            if (this.inventoryItems[i] === undefined) {
                this.inventoryItems[i] = item;
                this.world.uiManager.inventoryUI.refreshInventoryIcons();
                return i;
            }
        }
        return -1;
    }

    public addItems(items: InventoryItem[]) {
        for (let [i, item] of enumerate(items)) {
            if (this.addItem(item) < 0) return i;
        }
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

    public equipItem(item: EquipmentItem): boolean;
    public equipItem(atIndex: number): boolean;
    public equipItem(i: number | EquipmentItem) {
        let item: EquipmentItem;
        let idx: number;
        if (typeof i === "number") {
            let idxItem = this.inventoryItems[i];
            if (!EquipmentItem.isEquipmentItem(idxItem)) return false;
            item = idxItem;
            idx = i;
        } else {
            idx = this.inventoryItems.indexOf(i);
            if (idx < -1) return false;
            item = i;
        }
        let oldItem = this.equipment[item.equipmentType];
        let oldSkills = oldItem ? oldItem.getSkills() : [];
        let newSkills = item.getSkills();
        this.equipment[item.equipmentType] = item;
        this.inventoryItems[idx] = oldItem;
        item.addEquipmentGraphic(this.world.actorManager.player);

        let player = this.world.actorManager.player;
        for (let oldSkill of oldSkills) {
            if (newSkills.indexOf(oldSkill) < 0) {
                player.skillbar.removeSkill(oldSkill);
            }
        }
        for (let newSkill of newSkills) {
            if (oldSkills.indexOf(newSkill) < 0) {
                player.skillbar.addSkill(newSkill);
            }
        }
        this.world.uiManager.inventoryUI.refreshInventoryIcons();
        return true;
    }

    public unequip(slot: keyof IEquipmentSlots) {
        let player = this.world.actorManager.player;
        let item = this.equipment[slot];
        if (!this.hasSpace() || !item) return false;
        this.addItem(item);
        this.equipment[slot] = undefined;
        let skills = item.getSkills();
        for (let skill of (skills)) {
            player.skillbar.removeSkill(skill);
        }
        player.unsetEquipmentGraphic(slot);
        this.world.uiManager.inventoryUI.refreshInventoryIcons();
        return true;
    }

    public findItem(id: number) {
        for (let item of this.inventoryItems) {
            if (item && item.id === id) return item;
        }
        return undefined;
    }

    public dropItem(idx: number) {
        let item = this.removeItem(idx);
        if (!item) return false;
        let worldItem = new WorldItem(item);
        worldItem.x = this.world.actorManager.player.horizontalCenter;
        worldItem.y = this.world.actorManager.player.verticalCenter;
        worldItem.velocity.y = -8;
        worldItem.velocity.x = Math.random() * 10 - 5;
        this.world.addWorldObject(worldItem);
        return true;
    }

}
