import {Player} from "../actors/Player";
import {BuffStat} from "../buffs/Buff";
import {SoftTextParticle} from "../particlesystem/SoftTextParticle";
import {juggler} from "../root";
import * as pc from "../world/physicalConstants";
import {World} from "../world/World";
import {EquipmentItem, IEquipmentStats} from "./items/EquipmentItem";

export class PlayerStats {

    private healthTickTimer = 0;

    private _energy = 100;
    private _health = 50;
    set health(val) {
        this.setHealth(val);
    }
    get health() {
        return this._health;
    }

    set energy(val) {
        if (val < 0) val = 0;
        if (val > this.maxEnergy) val = this.maxEnergy;
        this._energy = val;
    }
    get energy() {
        return this._energy;
    }

    private healthAcc = 0;
    private energyAcc = 0;
    private frameCache: { [name: string]: any } = {};

    constructor(private player: Player, private world: World) {
        this.fullHeal();
        juggler.add(() => this.frameCache = {});
    }

    public setHealth(val: number, overrideDeath = false) {
        if (!overrideDeath && this.player.isDead()) return;
        if (val < 0) val = 0;
        if (val > this.maxHealth) val = this.maxHealth;
        this._health = val;
    }

    public fullHeal() {
        let diff = this.maxHealth - this.health;
        this._health = this.maxHealth;
        return diff;
    }

    public update() {
        if (!this.player.isInCombat && this._health < this.maxHealth) {
            this.healthAcc += this.healthRegen * 100;
        } else {
            this.healthAcc += this.healthRegen;
        }
        this.healthTickTimer ++;
        if (this.healthTickTimer >= 60 && this.healthAcc >= 1) {
            this.healthTickTimer = 0;
            let prevHealth = this.health;
            let healing = Math.floor(this.healthAcc);
            this.health += healing;
            this.healthAcc -= healing;
            if (this.health - prevHealth > 0) {
                let particle = new SoftTextParticle("+" + (this.health - prevHealth).toFixed(0), 0x08CC08, this.world);
                particle.velocity.y = -0.75;
                particle.x = this.player.horizontalCenter;
                particle.y = this.player.top;
                this.world.particleSystem.add(particle, false);
                this.world.uiManager.worldLayers[1].addChild(particle);
            }
        }
        this.energyAcc += this.energyRegen;
        this.energy += Math.floor(this.energyAcc);
        this.energyAcc -= Math.floor(this.energyAcc);
    }

    public physicalDamageAmount() {
        let range = this.physicalAttackDamageRange;
        return Math.round(Math.random() * (range[1] - range[0]) + range[0]);
    }

    public magicDamageAmount() {
        let range = this.magicAttackDamageRange;
        return Math.round(Math.random() * (range[1] - range[0]) + range[0]);
    }

    public get jumpPower() {
        return this.player.buffs.process("getStats", { stat: "jumpPower", amount: pc.JUMP_POWER });
    }

    public get walkSpeed() {
        return this.hitCache(this.calcWalkSpeed, "WalkSpeed");
    }

    public get healthRegen() {
        return this.hitCache(this.calcHealthRegen, "HealthRegen");
    }

    public get energyRegen() {
        return this.hitCache(this.calcEnergyRegen, "EnergyRegen");
    }

    public get maxHealth() {
        return this.hitCache(this.calcMaxHealth, "MaxHealth");
    }

    public get maxEnergy() {
        return this.hitCache(this.calcMaxEnergy, "MaxEnergy");
    }

    public get globalCooldown() {
        return this.hitCache(this.calcGlobalCooldown, "GlobalCooldown");
    }

    public get haste() {
        return this.hitCache(this.calcHaste, "Haste");
    }

    public get criticalHitChance() {
        return this.hitCache(this.calcCriticalHitChance, "CriticalHitChance");
    }

    public get agility() {
        return this.hitCache(this.calcAgility, "Agility");
    }

    public get strength() {
        return this.hitCache(this.calcStrength, "Strength");
    }

    public get intelligence() {
        return this.hitCache(this.calcIntelligence, "Intelligence");
    }

    public get cooldownReduction() {
        return this.hitCache(this.calcCooldownReduction, "CooldownReduction");
    }

    public get physicalAttackDamageRange() {
        return this.hitCache(this.calcPhysicalAttackDamageRange, "PhysDamage");
    }

    public get magicAttackDamageRange() {
        return this.hitCache(this.calcMagicAttackDamageRange, "MagicDamage");
    }

    public get armor() {
        return this.hitCache(this.calcArmor, "Armor");
    }

    public get ilvl() {
        return this.hitCache(this.calcILVL, "ilvl");
    }

    public get attackSpeed() {
        return this.hitCache(this.calcAttackSpeed, "attackSpeed");
    }

    private calcAttackSpeed() {
        return this.processBuffs("attackSpeed", this.getEquipmentStats("attackSpeed"));
    }

    private calcMaxHealth() {
        let max = this.processBuffs("health", 50 + this.getEquipmentStats("health"));
        if (this._health > max) {
            this._health = max;
        }
        return max;
    }

    private calcMaxEnergy() {
        let max = this.processBuffs("energy", 100 + this.getEquipmentStats("energy"));
        if (this._energy > max) {
            this._energy = max;
        }
        return max;
    }

    private calcHaste() {
        return this.processBuffs("haste", this.getEquipmentStats("haste"));
    }

    private calcGlobalCooldown() {
        let miniHaste = this.haste / 100;
        return 60 - 50 * (miniHaste / (miniHaste + 1));
    }

    private calcWalkSpeed() {
        let speed = pc.WALK_IMPULSE + this.getEquipmentStats("walkSpeed") / 40 + this.haste / 3000;
        speed = this.processBuffs("walkSpeed", speed);
        return speed;
    }

    // number between 0 and 1
    private calcCriticalHitChance() {
        let agi = this.agility / 100;
        return this.processBuffs("criticalHitChance", agi / (agi + 1));
    }

    // base 5 + equipment stats
    private calcAgility() {
        return this.processBuffs("agility", 1 + this.getEquipmentStats("agility"));
    }

    // base 5 + equipment stats
    private calcStrength() {
        return this.processBuffs("strength", 1 + this.getEquipmentStats("strength"));
    }

    // base 5 + equipment stats
    private calcIntelligence() {
        return this.processBuffs("intelligence", 1 + this.getEquipmentStats("intelligence"));
    }

    private calcCooldownReduction() {
        let equips = this.player.inventory.equipment;
        let statVal = 0;
        for (let key of Keys(equips)) {
            let equip = equips[key];
            if (equip && equip.stats.cooldownReduction) statVal = 1 - (1 - statVal) * (1 - equip.stats.cooldownReduction);
        }
        return this.processBuffs("cooldownReduction", statVal);
    }

    // base 1/1000 + equipment stats
    private calcHealthRegen() {
        return this.processBuffs("healthRegen", 1 / 1000 + this.getEquipmentStats("healthRegen") / 60);
    }

    // base 1/20 + equipment stats
    private calcEnergyRegen() {
        return this.processBuffs("energyRegen", 1 / 30 + this.getEquipmentStats("energyRegen") / 60);
    }

    // stuff with strength and agility, agility is the main contributor to the minimum attack damage
    private calcPhysicalAttackDamageRange(): [number, number] {
        let damage = this.strength * 0.6 + this.agility * 0.4 + this.getEquipmentStats("physicalDamage");
        let min = (this.strength * 0.5 + this.agility) / 10;
        min = min / (min + 1) * 0.75 + 0.25;
        return [Math.ceil(damage * min), Math.ceil(damage)];
    }

    // mostly just intelligence, little bit of agility on the min
    private calcMagicAttackDamageRange(): [number, number] {
        let damage = this.intelligence * 0.9 + this.getEquipmentStats("magicDamage");
        let min = (this.agility * 0.2 + this.intelligence * 0.5) / 5;
        min = min / (min + 1) * 0.75 + 0.25; ;
        return [Math.ceil(damage * min), Math.ceil(damage)];
    }

    // literally just your armor
    private calcArmor() {
        return this.processBuffs("armor", this.getEquipmentStats("armor"));
    }

    private calcILVL() {
        let equips = this.player.inventory.equipment;
        let ilvl = 0;
        for (let key of Keys(equips)) {
            let equip = equips[key];
            if (equip && equip.ilvl) ilvl += equip.ilvl;
        }
        return ilvl;
    }

    private hitCache<T>(getter: () => T, cacheName: string): T {
        if (this.frameCache[cacheName]) return this.frameCache[getter.name];
        return this.frameCache[getter.name] = getter.call(this);
    }

    private getEquipmentStats(stat: keyof IEquipmentStats) {
        let equips = this.player.inventory.equipment;
        let statVal = 0;
        for (let key of Keys(equips)) {
            let equip = equips[key];
            if (equip && equip.stats[stat]) statVal += equip.stats[stat]!;
        }
        return statVal;
    }

    private processBuffs(stat: BuffStat, baseAmount: number) {
        return this.player.buffs.process("getStats", { stat, amount: baseAmount } );
    }
}
