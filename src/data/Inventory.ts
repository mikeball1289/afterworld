import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import EquipmentItem from "./items/EquipmentItem";
import GemItem from "./items/GemItem";
import InventoryItem from "./items/InventoryItem";
import * as ItemFactory from "./items/ItemFactory";
import WeaponItem from "./items/WeaponItem";
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

export default class Inventory {
    public static INVENTORY_SIZE = 36;

    public inventoryItems: (InventoryItem | undefined)[] = [
        ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe).fillStats(1, {
            physicalDamage: 3,
        } ),
        ItemFactory.constructItem("weapon", ItemFactory.itemData.heros_sword).fillStats(10, {
            physicalDamage: 25,
            magicDamage: 15,
            strength: 5,
            intelligence: 5,
            agility: 5,
            health: 15,
        } ).prefix("Virtuous"),
        ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe).fillStats(1, {
            physicalDamage: 3,
        } ).addInscription(skillData.cleave).prefix("Heavy"),
        ItemFactory.constructItem("equip", ItemFactory.itemData.wooden_buckler).fillStats(2, {
            armor: 4,
            health: 5,
        } ),
        ItemFactory.constructItem("weapon", ItemFactory.itemData.iron_dagger).fillStats(3, {
            physicalDamage: 5,
            agility: 2,
            walkSpeed: 1,
        } ).postfix("of the Wind"),
        ItemFactory.constructItem("equip", ItemFactory.itemData.cloth_shirt).addSocket().fillStats(1, {
            armor: 3,
        } ),
        ItemFactory.constructItem("equip", ItemFactory.itemData.leather_pants).addSocket(ItemFactory.constructItem("gem", ItemFactory.itemData.leap_gem)).fillStats(1, {
            armor: 2,
        } ),
        ItemFactory.constructItem("equip", ItemFactory.itemData.leather_boots).addSocket(ItemFactory.constructItem("gem", ItemFactory.itemData.tremor_gem)).fillStats(1, {
            armor: 1,
        } ),
        ItemFactory.constructItem("equip", ItemFactory.itemData.wooden_buckler).addSocket().fillStats(3, {
            armor: 7,
            health: 6,
            strength: 2,
        } ).prefix("Hardy"),
        ItemFactory.constructItem("equip", ItemFactory.itemData.wooden_buckler).addSocket().fillStats(3, {
            armor: 7,
            health: 7,
            healthRegen: 0.1,
        } ).postfix("of the Bear"),
        ItemFactory.constructItem("gem", ItemFactory.itemData.envenom_gem),
        ItemFactory.constructItem("gem", ItemFactory.itemData.buckle_down_gem),
        ItemFactory.constructItem("gem", ItemFactory.itemData.explosion_gem),
        ItemFactory.constructItem("weapon", ItemFactory.itemData.gnarled_staff).fillStats(1, {
            magicDamage: 3,
            intelligence: 1,
        } ).addInscription(skillData.staticBolts).prefix("Crackling"),
        ItemFactory.constructItem("weapon", ItemFactory.itemData.gnarled_staff).fillStats(1, {
            magicDamage: 3,
            intelligence: 1,
        } ).addInscription(skillData.sentinelFlames).prefix("Blazing"),
    ];
    public equipment: IEquipmentSlots = {
        head: undefined,
        neck: undefined,
        body: ItemFactory.constructItem("equip", ItemFactory.itemData.cloth_shirt).fillStats(1, {
            armor: 3,
        } ),
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
        for (let i = 0; i < Inventory.INVENTORY_SIZE; i ++) {
            if (this.inventoryItems[i] === undefined) {
                this.inventoryItems[i] = item;
                this.world.uiManager.inventoryUI.refreshInventoryIcons();
                return i;
            }
        }
        return -1;
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
            throw new Error("Not yet implemented.");
        }
        let oldItem = this.equipment[item.equipmentType];
        let oldSkill = oldItem ? oldItem.getSkill() : undefined;
        let newSkill = item.getSkill();
        this.equipment[item.equipmentType] = item;
        this.inventoryItems[idx] = oldItem;
        item.addEquipmentGraphic(this.world.actorManager.player);

        let player = this.world.actorManager.player;
        if (oldSkill !== newSkill) {
            if (oldSkill) player.skillBar.removeSkill(oldSkill);
            if (newSkill) player.skillBar.addSkill(newSkill);
        }
        return true;
    }

    public unequip(slot: keyof IEquipmentSlots) {
        let player = this.world.actorManager.player;
        let item = this.equipment[slot];
        if (!this.hasSpace() || !item) return false;
        this.addItem(item);
        this.equipment[slot] = undefined;
        let skill = item.getSkill();
        if (skill) player.skillBar.removeSkill(skill);
        player.unsetEquipmentGraphic(slot);
        return true;
    }

}
