import { fromTextureCache } from "../pixiTools";
import World from "../world/World";
import JuggledSprite from "./JuggledSprite";

export default class StatUI extends JuggledSprite {

    constructor(world: World) {
        super(fromTextureCache("/images/stats_ui.png"));
    }
}
