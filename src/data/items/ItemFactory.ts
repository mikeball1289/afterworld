import { fromTextureCache } from "../../pixiTools";
import EquipmentItem from "./EquipmentItem";
import InventoryItem from "./InventoryItem";
import WeaponItem from "./WeaponItem";

type ItemType = "feet" | "legs" | "heavy" | "light" | "magic" | "head" | "body" | "item" | "neck" | "trinket" | "gloves" | "offhand";

interface IItemData {
    type: ItemType;
    name: string;
    sheetName?: string;
    icon: [number, number];
    range?: number;
    id?: number;
    description: string;
}

type I = IItemData;

let p: <T>(x: T, y: T) => [T, T] = (x, y) => [x, y];

export let itemData = {
    heros_sword: <I> {
        type: "heavy",
        name: "Hero's Sword",
        sheetName: "heros_sword",
        icon: p(2, 0),
        range: 60,
        description: "A mighty <red>sword</red> <green>weilded</green> by a true hero.",
    },

    cloth_shirt: <I> {
        type: "body",
        name: "Cloth Shirt",
        sheetName: "cloth_shirt",
        icon: p(0, 0),
        description: "A simple cloth shirt.",
    },

    iron_dagger: <I> {
        type: "light",
        name: "Iron Dagger",
        sheetName: "iron_dagger",
        icon: p(1, 0),
        range: 40,
        description: "A simple iron dagger.",
    },

    leather_pants: <I> {
        type: "legs",
        name: "Leather Pants",
        sheetName: "leather_pants",
        icon: p(3, 0),
        description: "A pair of stitched leather pants.",
    },

    leather_boots: <I> {
        type: "feet",
        name: "Leather Shoes",
        sheetName: "leather_boots",
        icon: p(4, 0),
        description: "A pair of stitched leather shoes.",
    },

    woodchopping_axe: <I> {
        type: "heavy",
        name: "Woodchopping Axe",
        sheetName: "woodchopping_axe",
        icon: p(8, 0),
        range: 50,
        description: "A medium-sized axe, clearly intended for chopping wood.",
    },

    wooden_buckler: <I> {
        type: "offhand",
        name: "Wooden Buckler",
        sheetName: "wood_buckler",
        icon: p(9, 0),
        description: "The woodsman said it was a buckler, but it just looks like half a log. Oh well.",
    },
};

{
    let i = 0;
    for (let itemName of Keys(itemData)) {
        itemData[itemName].id = i ++;
    }
}

export function constructItem(type: "weapon", data: IItemData): WeaponItem;
export function constructItem(type: "equip", data: IItemData): EquipmentItem;
export function constructItem(type: "item", data: IItemData): InventoryItem;
export function constructItem(type: "weapon" | "equip" | "item", data: IItemData): InventoryItem {
    if (data.type === "light" || data.type === "heavy" || data.type === "magic") {
        if (type !== "weapon") throw new Error("wrong factory type");
        return new WeaponItem(fromTextureCache("/images/item_sheet.png", data.icon[0] * 40, data.icon[1] * 40, 40, 40),
                                data.name, data.sheetName || "", data.description, data.range || 1, data.type);
    } else if (data.type === "item") {
        if (type !== "item") throw new Error("wrong factory type");
        throw new Error("Not implemented yet");
    } else {
        if (type !== "equip") throw new Error("wrong factory type");
        return new EquipmentItem(fromTextureCache("/images/item_sheet.png", data.icon[0] * 40, data.icon[1] * 40, 40, 40),
                                data.type, data.name, data.sheetName || "", data.description);
    }
}
