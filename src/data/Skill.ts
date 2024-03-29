import {Player} from "../actors/Player";
import {World} from "../world/World";
import {Cost} from "./costs/Cost";
import {WeaponType} from "./items/WeaponItem";
import {ISkillFunction} from "./skillHelpers";

export class Skill {

    public cooldownTimer = 0;
    private _icon: PIXI.Texture;
    constructor(private iconFn: () => PIXI.Texture,
                public skillFn: ISkillFunction,
                public costs: Cost[],
                public weaponTypes: WeaponType[] | "any" | "none",
                public cooldown: number,
                public name: string,
                public description: string,
                public gcd = true) {
        this.cooldown *= 60;
    }

    public playerCanCast(player: Player, world: World) {
        if (this.weaponTypes !== "none" &&
            (!player.inventory.equipment.weapon ||
                (this.weaponTypes !== "any" && this.weaponTypes.indexOf(player.inventory.equipment.weapon.weaponType) < 0))) return false;
        for (let cost of this.costs) {
            if (!cost.playerCanPay(player)) return false;
        }
        return true;
    }

    public get icon() {
        if (!this._icon) this._icon = this.iconFn();
        return this._icon;
    }

    public cast(player: Player, world: World) {
        if (this.skillFn(player, world)) {
            this.putOnCooldown(player.stats.cooldownReduction);
            for (let cost of this.costs) {
                cost.payCost(player);
            }
            return true;
        }
        return false;
    }

    public putOnCooldown(cooldownReduction: number) {
        this.cooldownTimer = Math.ceil(this.cooldown * (1 - cooldownReduction));
    }

    public tickCooldown() {
        if (this.cooldown > 0) {
            this.cooldownTimer --;
        }
    }

    public getName() {
        return this.name;
    }

    public getDescription(includeName = false) {
        let des = includeName ? (this.name + " ") : "";
        des += "(" + Math.round(this.cooldown / 60) + " sec";
        if (this.costs.length > 0) {
            des += ", " + this.costs.map( (cost) => cost.costAmount + " " + cost.costType ).join(", ") + ")\n";
        } else {
            des += ")\n";
        }
        if (this.weaponTypes !== "any" && this.weaponTypes !== "none") {
            des += "requires " + this.weaponTypes.join(" OR ") + " weapon\n";
        }
        des += "\n" + this.description;
        return des;
    }
}
