import Map from "./world/Map";
import PlayerCharacter from "./actors/PlayerCharacter";
import * as root from "./root";
import * as fs from "fs";

export function preload(images: string[]): void;
export function preload(all: boolean): void;
export function preload(arg: boolean | string[]) {
    let app = new PIXI.Application(800, 600, { backgroundColor: 0x42f4e8, antialias: false });
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
    document.body.appendChild(app.view);

    let loader = PIXI.loader;
    if (arg === true) {
        let files = fs.readdirSync("images");
        files.forEach( (file) => loader.add("/images/" + file) );
        loader.load( () => main(app) );
    } else if (arg instanceof Array) {
        arg.forEach( (file) => loader.add(file) );
        loader.load( () => main(app) );
    } else {
        main(app);
    }
}

function main(app: PIXI.Application) {
    root.root.setStage(app.stage);

    let map = new Map(PIXI.loader.resources["/images/map.png"].texture);
    root.root.stage.addChild(map);

    let player = new PlayerCharacter();
    root.root.stage.addChild(player);

    
}