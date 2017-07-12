// import {TestSprite} from "./TestSprite";
import {keyboard} from "./root";
import {JuggledSprite} from "./display/JuggledSprite";
import * as Key from "./Key";
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

function getZIndex(x: number, y: number, z: number = 0) {
    let coarseX = Math.tanh(Math.floor(x) / 1000) * 100000000;
    let coarseY = Math.tanh(Math.floor(y) / 1000) * 100000;
    let coarseZ = Math.tanh(Math.floor(z) / 1000) * 100;
    let coarse = Math.floor(coarseX + coarseY + coarseZ);
    let xDec = x - Math.floor(x);
    let yDec = y - Math.floor(y);
    let zDec = z - Math.floor(z);
    let fine = (x + y + z) / 3;
    return -(coarse + fine);
}

function main(app: PIXI.Application) {
    app.stage.displayList = new PIXI.DisplayList();
    let worldGroup = new PIXI.DisplayGroup(0, true);

    let blockTexture = PIXI.loader.resources["/images/block.png"].texture;

    let blocks = {};

    for (let i = 0; i < 8; i ++) {
        for (let j = 0; j < 8; j ++) {
            let block = new PIXI.Sprite(blockTexture);
            block.displayGroup = worldGroup;
            block.x = 400 + i * 25 - j * 25;
            block.y = 300 + i * 15 + j * 15;
            if (i === 4 && j === 4) {
                block.anchor.set(0.5, 0.7 * 30 / block.height);
                block.zOrder = getZIndex(i, j, 0.7);
            } else {
                block.anchor.set(0.5, 0 / block.height);
                block.zOrder = getZIndex(i, j);
            }
            app.stage.addChild(block);
        }
    }

    let playerPosition = { x: 3, y: 3, z: 0 };
    let playerRadius = 1 / 4;

    let player = new JuggledSprite(PIXI.loader.resources["/images/sampleBall.png"].texture);
    player.anchor.set(0.5, 20 / player.height);
    player.onEnterFrame = () => {
        if (keyboard.isKeyDown(Key.DOWN)) {
            playerPosition.y += 0.03;
            playerPosition.x += 0.03;
        } else if (keyboard.isKeyDown(Key.UP)) {
            playerPosition.y -= 0.03;
            playerPosition.x -= 0.03;
        }
        if (keyboard.isKeyDown(Key.LEFT)) {
            playerPosition.x -= 0.03;
            playerPosition.y += 0.03;
        } else if (keyboard.isKeyDown(Key.RIGHT)) {
            playerPosition.x += 0.03;
            playerPosition.y -= 0.03;
        }

        player.x = 400 + playerPosition.x * 25 - playerPosition.y * 25;
        player.y = 300 + playerPosition.x * 15 + playerPosition.y * 15 - playerPosition.z * 30;
        
        let corners = [ [playerPosition.x + playerRadius, playerPosition.y + playerRadius],
                        [playerPosition.x + playerRadius, playerPosition.y - playerRadius],
                        [playerPosition.x - playerRadius, playerPosition.y + playerRadius],
                        [playerPosition.x - playerRadius, playerPosition.y - playerRadius],
        ];

        player.zOrder = getZIndex(corners[0][0], corners[0][1], playerPosition.z);
        for (let corner of corners) {
            if (corner[0] < 5 && corner[0] >= 4 && corner[1] < 5 && corner[1] >= 4) {
                playerPosition.z = 0.7;
                break;
            } else {
                playerPosition.z = 0;
            }
        }
    };
    player.displayGroup = worldGroup;

    app.stage.addChild(player);
}