import World from "../world/World";

export default class PlayerStats {
    public maxHealth = 50;
    public _health = 50;
    set health(val) {
        if (val < 0) val = 0;
        if (val > this.maxHealth) val = this.maxHealth;
        this._health = val;
    }
    get health() {
        return this._health;
    }

    constructor(private world: World) {
        this.fullHeal();
    }

    public fullHeal() {
        let diff = this.maxHealth - this.health;
        this.health = this.maxHealth;
        return diff;
    }
}
