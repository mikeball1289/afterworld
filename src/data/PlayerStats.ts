import Player from "../actors/Player";
import SoftTextParticle from "../particlesystem/SoftTextParticle";
import { juggler } from "../root";
import * as pc from "../world/physicalConstants";
import World from "../world/World";

export default class PlayerStats {

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
        this.healthAcc += this.healthRegen;
        this.healthTickTimer ++;
        if (this.healthTickTimer >= 60 && this.healthAcc >= 1) {
            let healing = Math.floor(this.healthAcc);
            this.health += healing;
            this.healthAcc -= healing;
            let particle = new SoftTextParticle(healing.toFixed(0), 0x08CC08);
            particle.velocity.y = -0.75;
            particle.x = this.player.horizontalCenter;
            particle.y = this.player.top;
            this.world.particleSystem.add(particle, false);
            this.world.uiManager.worldLayers[1].addChild(particle);
        }
        this.energyAcc += this.energyRegen;
        this.energy += Math.floor(this.energyAcc);
        this.energyAcc -= Math.floor(this.energyAcc);
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
        return this.hitCache(this.calcPhysicalAttackDamageRange, "MagicDamage");
    }

    public get armor() {
        return this.hitCache(this.calcArmor, "Armor");
    }

    private calcMaxHealth() {
        return 50;
    }

    private calcMaxEnergy() {
        return 100;
    }

    private calcHaste() {
        return 0;
    }

    private calcGlobalCooldown() {
        return 60;
    }

    private calcWalkSpeed() {
        return this.player.buffs.process("getStats", { stat: "walkSpeed", amount: pc.WALK_IMPULSE });
    }

    private calcCriticalHitChance() {
        return 0;
    }

    private calcAgility() {
        return 5;
    }

    private calcStrength() {
        return 5;
    }

    private calcIntelligence() {
        return 5;
    }

    private calcCooldownReduction() {
        return 0;
    }

    private calcHealthRegen() {
        return 1 / 1000;
    }

    private calcEnergyRegen() {
        return 1 / 20;
    }

    private calcPhysicalAttackDamageRange(): [number, number] {
        return [1, 3];
    }

    private calcMagicAttackDamageRange(): [number, number] {
        return [1, 3];
    }

    private calcArmor() {
        return 0;
    }

    private hitCache<T>(getter: () => T, cacheName: string): T {
        if (this.frameCache[cacheName]) return this.frameCache[getter.name];
        return this.frameCache[getter.name] = getter.call(this);
    }
}
