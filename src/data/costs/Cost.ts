import {Player} from "../../actors/Player";

export type CostType = "health" | "energy";

export class Cost {

    constructor(public costType: CostType, public costAmount: number) { }

    public playerCanPay(player: Player): boolean {
        switch (this.costType) {
            case "health": return player.stats.health >= this.costAmount;
            case "energy": return player.stats.energy >= this.costAmount;
            default: return false;
        }
    }

    public payCost(player: Player): boolean {
        if (this.costType === "health") {
            if (player.stats.health >= this.costAmount) {
                player.stats.health -= this.costAmount;
                return true;
            } else {
                return false;
            }
        } else if (this.costType === "energy") {
            if (player.stats.energy >= this.costAmount) {
                player.stats.energy -= this.costAmount;
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

}
