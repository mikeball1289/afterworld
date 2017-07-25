import JuggledSprite from "../JuggledSprite";

export default class PlayerCharacter extends JuggledSprite {

    constructor() {
        super();

    }

    onEnterFrame() {
        console.log("I'm doing things");
    }
}