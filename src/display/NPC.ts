import {Actor} from "../actors/Actor";
import {juggler} from "../root";
import {INPCData} from "../world/mapData";
import {Animator} from "./Animator";
import {JuggledSprite} from "./JuggledSprite";

export class NPC extends JuggledSprite {

    private interactablePrompt: Animator<{ dotdotdot: [number, number] }>;
    private interactableOpen: boolean = false;

    constructor(texture: PIXI.Texture, public npcData: INPCData) {
        super(texture);
        this.anchor.set(0.5, 1);
        this.x = npcData.position.x;
        this.y = npcData.position.y;
        this.interactablePrompt = new Animator(PIXI.loader.resources["/images/speech_bubble.png"].texture, new PIXI.Point(50, 40), {
            dotdotdot: [0, 4],
        }, "dotdotdot", 4);
        this.interactablePrompt.anchor.set(0.5, 1);
        this.interactablePrompt.y = -this.texture.height - 5;
        this.interactablePrompt.visible = false;
        this.addChild(this.interactablePrompt);
    }

    public setInteractablePrompt(on: boolean) {
        if (on === this.interactableOpen) return;
        this.interactableOpen = on;
        if (on && !this.interactablePrompt.visible) {
            this.interactablePrompt.play("dotdotdot", {
                loop: true,
                override: true,
            } );
            this.interactablePrompt.visible = true;
            this.interactablePrompt.scale.set(0.1);
        }
    }

    public onEnterFrame() {
        if (this.interactableOpen && this.interactablePrompt.scale.x < 1) {
            this.interactablePrompt.scale.x += 0.09;
            this.interactablePrompt.scale.y += 0.09;
            if (this.interactablePrompt.scale.x > 1) this.interactablePrompt.scale.set(1);
        }
        if (!this.interactableOpen && this.interactablePrompt.visible) {
            this.interactablePrompt.scale.x -= 0.09;
            this.interactablePrompt.scale.y -= 0.09;
            if (this.interactablePrompt.scale.x < 0.01) this.interactablePrompt.visible = false;
        }
    }

    public withinTalkingRange(actor: Actor) {
        return actor.left < this.x + this.texture.width && actor.right > this.x - this.texture.width && actor.bottom > this.y - this.texture.height && actor.top < this.y;
    }

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        this.removeChild(this.interactablePrompt);
        super.destroy(true);
        this.interactablePrompt.destroy();
    }

}
