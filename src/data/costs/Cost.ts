import Player from "../../actors/Player";

export type CostType = "health" | "energy";

export default class Cost {

    constructor(public costType: CostType, public costAmout: number) { }

    public playerCanPay(player: Player): boolean {
        switch (this.costType) {
            case "health": return player.stats.health >= this.costAmout;
            case "energy": return player.stats.energy >= this.costAmout;
            default: return false;
        }
    }

    public payCost(player: Player): boolean {
        if (this.costType === "health") {
            if (player.stats.health >= this.costAmout) {
                player.stats.health -= this.costAmout;
                return true;
            } else {
                return false;
            }
        } else if (this.costType === "energy") {
            if (player.stats.energy >= this.costAmout) {
                player.stats.energy -= this.costAmout;
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

}
