import World from "../../world/World";

export default class InventoryItem {
    private static ITEM_ID = 0;

    public type: "equipment" | "use" | "item" = "item";
    public id: number;
    constructor(public graphic: PIXI.Texture,
                public name: string,
                public description: string | ((world: World) => string))
    { }
}
