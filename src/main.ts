import update from "./world/driver";
import World from "./world/World";
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

    let world = new World();
    app.stage.addChild(world);

    root.juggler.add( () => {
        update(world);
        let targetX = -world.player.x + app.view.width / 2 - world.player.size.x / 2;
        let targetY = -world.player.y + app.view.height / 2 - world.player.size.y / 2;
        world.x += (targetX - world.x) / 15;
        world.y += (targetY - world.y) / 15;
        world.x = Math.min(Math.max(world.x, -world.map.digitalWidth + app.view.width), 0);
        world.y = Math.min(Math.max(world.y, -world.map.digitalHeight + app.view.height), 0);
    } );
}