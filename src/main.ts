import * as fs from "fs";
import {Animator} from "./display/Animator";
import * as Key from "./Key";
import {fromTextureCache} from "./pixiTools";
import * as root from "./root";
import {World} from "./world/World";

export function preload(images: string[]): void;
export function preload(all: boolean): void;
export function preload(arg: boolean | string[]) {
    let app = new PIXI.Application(1072, 603, { backgroundColor: 0x323438, antialias: false }); // uv coords are 2048 x 1024
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
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
    nw.Window.get().enterFullscreen();
    root.root.setApp(app);

    let world = new World("dark_forest1", app.view.width, app.view.height);
    // let world = new World("map1", app.view.width, app.view.height);
    app.stage.addChild(world);
    let fps = 60;
    let lastTick = 0;
    let fpsDisplay = new PIXI.Text("0", { align: "right", fontFamily: DEFAULT_FONT, fontSize: 17 } );
    fpsDisplay.anchor.set(1);
    fpsDisplay.x = app.view.width;
    fpsDisplay.y = app.view.height;
    app.stage.addChild(fpsDisplay);

    root.juggler.add( () => {
        world.update();

        if (lastTick > 0) {
            let tick = Date.now();
            if (!isFinite(fps)) {
                fps = 1000 / (tick - lastTick);
            } else {
                fps = fps * 0.99 + (1000 / (tick - lastTick)) * 0.01;
            }
            lastTick = tick;
        } else {
            lastTick = Date.now();
        }

        fpsDisplay.text = fps.toFixed(1);

        if (root.keyboard.isKeyDown(Key.ESCAPE)
            || root.controller.getButton(root.ControllerButton.START)
        ) window.close();
    } );
}
