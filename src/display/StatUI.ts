import { fromTextureCache } from "../pixiTools";
import { controls, InputType } from "../root";
import World from "../world/World";
import InventoryUI from "./InventoryUI";
import JuggledSprite from "./JuggledSprite";

export default class StatUI extends JuggledSprite {

    private itemTextures: PIXI.Container;
    private statHeaders1: PIXI.Text;
    private statHeaders2: PIXI.Text;
    private statBox1: PIXI.Text;
    private statBox2: PIXI.Text;
    private statBox3: PIXI.Text;

    constructor(private world: World) {
        super(fromTextureCache("/images/stats_ui.png"));
        this.itemTextures = new PIXI.Container();
        this.addChild(this.itemTextures);
        this.statHeaders1 = new PIXI.Text(
`Health          
Energy          
Armor          

Strength          
Agility          
Intelligence          

Physical Damage
Magic Damage`, {
            fontFamily: DEFAULT_FONT,
            align: "right",
        } );
        this.statHeaders1.anchor.set(1, 0);
        this.statHeaders1.x = 540;
        this.statHeaders1.y = 165;
        this.addChild(this.statHeaders1);
        this.statHeaders2 = new PIXI.Text(
`Haste
Speed
Crit Chance

Health Regen
Energy Regen`, {
            fontFamily: DEFAULT_FONT,
            align: "right",
        } );
        this.statHeaders2.anchor.set(1, 0);
        this.statHeaders2.x = 760;
        this.statHeaders2.y = 165;
        this.addChild(this.statHeaders2);

        this.statBox1 = new PIXI.Text("", { fontFamily: DEFAULT_FONT });
        this.statBox1.x = 430;
        this.statBox1.y = 165;
        this.statBox2 = new PIXI.Text("", { fontFamily: DEFAULT_FONT });
        this.statBox2.x = 550;
        this.statBox2.y = 381;
        this.statBox3 = new PIXI.Text("", { fontFamily: DEFAULT_FONT });
        this.statBox3.x = 775;
        this.statBox3.y = 165;
        this.addChild(this.statBox1);
        this.addChild(this.statBox2);
        this.addChild(this.statBox3);
    }

    public refreshStats() {
        let stats = this.world.actorManager.player.stats;
        this.statBox1.text =
`${stats.health} / ${stats.maxHealth}
${stats.energy} / ${stats.maxEnergy}
${stats.armor}

${stats.strength}
${stats.agility}
${stats.intelligence}`;

        this.statBox2.text =
`${stats.physicalAttackDamageRange.join(" - ")}
${stats.magicAttackDamageRange.join(" - ")}`;

        this.statBox3.text =
`${stats.haste}
${(stats.walkSpeed * 10).toFixed(1)}
${(stats.criticalHitChance * 100).toFixed(1)}%

${(stats.healthRegen * 60).toFixed(2)}
${(stats.energyRegen * 60).toFixed(2)}`;
    }

    public refreshInventoryIcons() {
        InventoryUI.prototype.refreshInventoryIcons.call(this, true);
    }

    public bringToFront() {
        this.refreshInventoryIcons();
        this.refreshStats();
        this.parent.setChildIndex(this, this.parent.children.length - 1);
    }

    private get isOnTop() {
        return this.parent.getChildIndex(this) === this.parent.children.length - 1;
    }

    public close() {
        this.world.uiManager.closeSelectMenu();
    }

    public get isOpen() {
        return this.isOnTop && this.world.uiManager.selectMenuIsOpen();
    }

    public onEnterFrame() {
        if (this.isOpen) {
            if (controls.hasLeadingEdge(InputType.CANCEL)) {
                this.close();
            } else {
                this.refreshStats();
            }
        }
    }
}
