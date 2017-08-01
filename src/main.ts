import World from "./world/World";
import * as root from "./root";
import * as fs from "fs";
import Animator from "./display/Animator";
import * as Key from "./Key";

export function preload(images: string[]): void;
export function preload(all: boolean): void;
export function preload(arg: boolean | string[]) {
    let app = new PIXI.Application(1072, 603, { backgroundColor: 0x323438, antialias: false });
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

    let world = new World("map1", app.view.width, app.view.height);
    app.stage.addChild(world);

    // let skelly = new Animator(PIXI.loader.resources["/images/skelly_sheet.png"].texture, new PIXI.Point(64, 64), {
    //                                 idle: [0, 4],
    //                                 walk: [1, 4],
    //                                 attack: [2, 4],
    //                                 die: [3, 7],
    //                             }, "idle");
    // app.stage.addChild(skelly);
    
    // // skelly.play("attack");
    // setInterval(() => {
    //     skelly.play("attack", false);
    // }, 3000);

    root.juggler.add( () => {
        // skelly.update(0.1);
        world.update();
        
        if (root.keyboard.isKeyDown(Key.ESCAPE) || root.controller.getButton(root.ControllerButton.START)) window.close();
    } );
}