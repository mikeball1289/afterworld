import World from "../../world/World";

export default class InventoryItem {
    private static ITEM_ID = 0;

    public type: "equipment" | "use" | "item" = "item";
    public id: number;
    constructor(public graphic: PIXI.Texture,
                public name: string,
                public description: string | ((world: World) => string))
    { }

    public getName() {
        return this.name;
    }

    public getDescription(world: World) {
        if (typeof this.description === "string") {
            return this.description;
        } else {
            return this.description(world);
        }
    }
}
