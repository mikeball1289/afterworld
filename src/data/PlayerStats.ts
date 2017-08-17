import Player from "../actors/Player";
import * as pc from "../world/physicalConstants";
import World from "../world/World";

export default class PlayerStats {

    public healthAcc = 0;
    public energyAcc = 0;
    public manaAcc = 0;

    public healthRegen = 1 / 100;
    public energyRegen = 1 / 12;
    public manaRegen = 1 / 100;

    public _energy = 100;
    public maxEnergy = 100;

    public _mana = 50;
    public maxMana = 50;

    public maxHealth = 50;
    private _health = 50;
    // public maxHealth = 99999;
    // private _health = 99999;
    set health(val) {
        if (val < 0) val = 0;
        if (val > this.maxHealth) val = this.maxHealth;
        this._health = val;
    }
    get health() {
        return this._health;
    }

    set mana(val) {
        if (val < 0) val = 0;
        if (val > this.maxMana) val = this.maxMana;
        this._mana = val;
    }
    get mana() {
        return this._mana;
    }

    set energy(val) {
        if (val < 0) val = 0;
        if (val > this.maxEnergy) val = this.maxEnergy;
        this._energy = val;
    }
    get energy() {
        return this._energy;
    }

    constructor(private player: Player, private world: World) {
        this.fullHeal();
    }

    public fullHeal() {
        let diff = this.maxHealth - this.health;
        this.health = this.maxHealth;
        return diff;
    }

    public update() {
        this.healthAcc += this.healthRegen;
        this.health += Math.floor(this.healthAcc);
        this.healthAcc -= Math.floor(this.healthAcc);
        this.energyAcc += this.energyRegen;
        this.mana += Math.floor(this.manaAcc);
        this.manaAcc -= Math.floor(this.manaAcc);
        this.manaAcc += this.manaRegen;
        this.energy += Math.floor(this.energyAcc);
        this.energyAcc -= Math.floor(this.energyAcc);
    }

    public get jumpPower() {
        return this.player.buffs.process("getStats", { stat: "jumpPower", amount: pc.JUMP_POWER });
    }

    public get walkSpeed() {
        return this.player.buffs.process("getStats", { stat: "walkSpeed", amount: pc.WALK_IMPULSE });
    }

    public get globalCooldown() {
        return 60;
    }
}
