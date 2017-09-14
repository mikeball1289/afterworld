import {INPCData} from "../world/mapData";
import {World} from "../world/World";

export interface IOption {
    optionText: string;
    next: IConversationPiece;
}

export interface ITextPack {
    text: ((world: World) => (string | ITextPack))[];
    options?: IOption[];
}

export interface IConversationPiece {
    (world: World): ITextPack;
}

export class ConversationalNPC implements INPCData {

    private text: ITextPack;
    private textIdx: number = 0;

    constructor(public name: string,
                public image: string,
                public position: { x: number, y: number },
                public conversation: IConversationPiece) {}

    public startInteraction(world: World) {
        this.text = this.conversation(world);
        this.textIdx = 0;
    }

    public getText(world: World): { text: string, options?: string[] } {
        let text = this.text.text[this.textIdx](world);
        if (typeof text === "object") {
            this.text = text;
            this.textIdx = 0;
            return this.getText(world);
        }
        this.textIdx ++;
        let options: string[] | undefined;
        if (this.textIdx === this.text.text.length && this.text.options !== undefined) {
            options = this.text.options.map( (o) => o.optionText );
        }
        return { text, options };
    }

    public continue(world: World, optionNumber?: number) {
        if (optionNumber !== undefined && this.text.options !== undefined) {
            this.text = this.text.options[optionNumber].next(world);
            this.textIdx = 0;
            return true;
        }
        return this.textIdx < this.text.text.length;
    }
}
