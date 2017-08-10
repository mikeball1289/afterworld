import World from "../world/World";
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
        body: new EquipmentItem(new PIXI.Texture(PIXI.loader.resources["/images/item_sheet.png"].texture.baseTexture, new PIXI.Rectangle(0, 0, 40, 40)),
                                    "body", "Cloth Shirt", "cloth_shirt", "A simple cloth shirt"),
        legs: undefined,
        feet: undefined,
        trinket: undefined,
        weapon: undefined,
        offhand: undefined,
        gloves: undefined,
    };

    constructor(private world: World) { }
}
