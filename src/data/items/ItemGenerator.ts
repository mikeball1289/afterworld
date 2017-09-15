import {EquipmentItem, IEquipmentStats} from "./EquipmentItem";

function neverStats(item: EquipmentItem): (keyof IEquipmentStats)[] {
    switch (item.equipmentType) {
        case "head": return ["physicalDamage", "magicDamage", "walkSpeed"];
        case "neck": return ["physicalDamage", "magicDamage", "armor", "walkSpeed"];
        case "body": return ["physicalDamage", "magicDamage", "walkSpeed"];
        case "legs": return ["physicalDamage", "magicDamage", "walkSpeed"];
        case "feet": return ["physicalDamage", "magicDamage"];
        case "weapon": return ["armor", "walkSpeed"];
        case "gloves": return ["physicalDamage", "magicDamage", "walkSpeed"];
        case "trinket": return ["physicalDamage", "magicDamage", "armor", "walkSpeed"];
        case "offhand": return ["physicalDamage", "magicDamage", "walkSpeed"];
        default: return [];
    }
}

// let prefixes: 

export function GenerateEquipment(item: EquipmentItem, rarity: number, level: number) {

    return item;
}
