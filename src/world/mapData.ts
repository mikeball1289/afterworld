import * as e from "../actors/enemies/enemies";
import SnapTrap from "../actors/enemies/SnapTrap";
import Enemy from "../actors/Enemy";
import ConversationalNPC from "../data/ConversationalNPC";
import * as Woodsman from "../data/conversations/WoodsmanConversation";
import GlowAccent from "../display/accents/GlowAccent";
import { fromTextureCache } from "../pixiTools";
import World from "../world/World";

interface IEnemyCtor {
    new(world: World): Enemy;
}

function all(...rest: Enemy[][]): Enemy[] {
    let agg: Enemy[] = [];
    for (let arr of rest) {
        agg = agg.concat(arr);
    }
    return agg;
}

function enemies(n: number, ctor: IEnemyCtor, world: World) {
    return new Array(n).fill(0).map( () => new ctor(world));
}

function enemyPack(enemies: Enemy[], center: PIXI.Point, spread: number): Enemy[] {
    for (let enemy of enemies) {
        enemy.setBottomCenter(center.x + (Math.random() * 2 - 1) * spread, center.y);
    }
    return enemies;
}

export interface INPCData {
    name: string;
    image: string;
    position: { x: number, y: number };
    startInteraction?: (world: World) => void;
    getText: (world: World) => { text: string, options?: string[] };
    continue?: (world: World, optionNumber?: number) => boolean;
}

export interface IMapDataObject {
    map: string;
    background: string;
    foreground?: string;
    npcs: INPCData[];
    enemies: (world: World) => Enemy[];
    entrances: {
        default: [number, number];
        [name: string]: [number, number];
    };
    exits: {[name: string]: [number, number] | [number, number][]};
    bgTrack: string;
    bgVolume?: number;
    backgroundAccents?: (world: World) => PIXI.DisplayObject[];
    foregroundAccents?: (world: World) => PIXI.DisplayObject[];
    isTown?: boolean;
    mapName?: string;
}

type MD = IMapDataObject;

let mapData: { [mapname: string]: IMapDataObject } = {
    map1: <MD> {
        map: "/maps/map.png",
        background: "/maps/map_back.png",
        npcs: [
            {
                name: "John",
                image: "/npcs/npc.png",
                position: {
                    x: 1645,
                    y: 1172 - 85,
                },
                getText: () => { return { text: "Hey hey cool cat. I'm John, the coolest\nguy in these parts. " +
                        "Did you know you can\ntalk to cool catz like me by pressing\nEnter on a keyboard or 'Y' on a gamepad?" }; },
            },
        ],
        enemies: (world: World) => {
            let enemies: Enemy[] = [];
            for (let i = 0; i < 10; i ++) {
                let skelly = new e.Skelly(world);
                skelly.x = 500 + Math.random() * 400;
                skelly.y = 1023 - skelly.size.y - 85;
                enemies.push(skelly);
            }
            let skelly = new e.Skelly(world);
            skelly.x = 2750;
            skelly.y = 1030 - 85;
            enemies.push(skelly);
            return enemies;
        },
        entrances: {
            default: p(1112, 955 - 85),
            map2: p(2890, 1158 - 85),
        },
        exits: {
            map2: p(2890, 1158 - 85),
        },
        bgTrack: "/sounds/CarrotWine_How_to_spend_winter.ogg",
    },
    map2: <MD> {
        map: "/maps/map2.png",
        background: "/maps/map2_back.png",
        entrances: {
            default: p(313, 259),
            map1: p(85, 464),
        },
        exits: {
            map1: p(85, 464),
        },
        npcs: [],
        enemies: () => {
            return [];
        },
        isTown: true,
        bgTrack: "/sounds/CarrotWine_How_to_spend_winter.ogg",
    },

    dark_forest1: <MD> {
        map: "/maps/dark_forest1_geometry.png",
        background: "/maps/dark_forest1_back.png",
        foreground: "/maps/dark_forest1_foreground.png",
        entrances: {
            default: p(144, 956 - 85),
            small_clearing: p(2950, 870),
        },
        exits: {
            small_clearing: [p(2950, 873), p(2980, 873)],
        },
        npcs: [],
        enemies: (world) => [
            new e.PassiveGhost(world).setBottomCenter(2100, 820),
            new e.PassiveGhost(world).setBottomCenter(486, 872),
            new e.WilloSpirit(world).setBottomCenter(1050, 625),
        ],
        bgTrack: "/sounds/CarrotWine_How_to_spend_winter.ogg",
        foregroundAccents: (world) => {
            let exitHighlight = new GlowAccent(world);
            exitHighlight.x = 2903;
            exitHighlight.y = 878 - 161;
            return [exitHighlight];
        },
    },

    small_clearing: <MD> {
        map: "/maps/small_clearing_geometry.png",
        background: "/maps/small_clearing.png",
        entrances: {
            default: p(770, 700),
            dark_forest1: p(25, 700),
            crossroads: p(1460, 700),
        },
        exits: {
            dark_forest1: [p(20, 700), p(50, 700)],
            crossroads: [p(1450, 700), p(1480, 700)],
        },
        npcs: [new ConversationalNPC("Woodsman", "/npcs/spriteBase.png", new PIXI.Point(437, 721), Woodsman.talk)],
        enemies: (world) => [
            new e.PassiveGhost(world).setBottomCenter(1020, 790),
        ],
        bgTrack: "/sounds/CarrotWine_How_to_spend_winter.ogg",
        foregroundAccents: (world) => {
            let exitHighlight1 = new GlowAccent(world);
            exitHighlight1.x = 1403;
            exitHighlight1.y = 721 - 161;
            let exitHighlight2 = new GlowAccent(world, true);
            exitHighlight2.x = 0;
            exitHighlight2.y = 721 - 161;
            return [exitHighlight1, exitHighlight2];
        },
        isTown: true,
    },

    crossroads: <MD> {
        map: "/maps/crossroads_geometry.png",
        background: "/maps/crossroads_back.png",
        entrances: {
            default: p(2665, 735),
            small_clearing: p(25, 870),
        },
        exits: {
            small_clearing: [p(20, 870), p(50, 870)],
            path_to_heart_of_the_forest: [p(2805, 440), p(2775, 440), p(2835, 440)],
        },
        npcs: [
            {
                name: "Crossroads Sign",
                image: "/npcs/sign.png",
                position: {
                    x: 701,
                    y: 873,
                },
                getText: () => { return { text: "West - Small Clearing\nNorth - Heart of the Forest\nEast - Woodhurst" }; },
            },
        ],
        enemies: (world) => all([
                new SnapTrap(world).setBottomCenter(1661, 874),
                new SnapTrap(world).setBottomCenter(1666, 592),
                new SnapTrap(world).setBottomCenter(2545, 442),
                new SnapTrap(world).setBottomCenter(4113, 592),
                new SnapTrap(world).setBottomCenter(2248, 642),
                new SnapTrap(world).setBottomCenter(3522, 742),
                new SnapTrap(world).setBottomCenter(4657, 874),
            ],
            enemyPack(enemies(2, e.Ghost, world), new PIXI.Point(1300, 873), 200),
            enemyPack(enemies(4, e.Ghost, world), new PIXI.Point(704, 591), 200),
            enemyPack(enemies(4, e.Ghost, world), new PIXI.Point(2886, 441), 200),
            enemyPack(enemies(5, e.Ghost, world), new PIXI.Point(4300, 591), 200),
        ),
        bgTrack: "/sounds/Foria - Break Away(eq).ogg",
        bgVolume: 1.5,
        foregroundAccents: (world) => [
            new GlowAccent(world).setBottomLeft(4903, 873),
            new GlowAccent(world, true).setBottomLeft(0, 873),
            new GlowAccent(world, false, fromTextureCache("/images/particles.png", 0, 25, 194, 161)).setBottomCenter(2805, 441),
        ],
    },

    path_to_heart_of_the_forest: <MD> {
        map: "/maps/heart_path_geometry.png",
        background: "/maps/heart_path_background.png",
        foreground: "/maps/heart_path_foreground.png",
        entrances: {
            default: p(540, 2868),
            crossroads: p(1650, 2868),
        },
        exits: {
            crossroads: [p(1650, 2868), p(2868, 1680)],
        },
        npcs: [],
        enemies: (world) => all([
                new e.WilloSpirit(world).setBottomCenter(900, 2050),
                new e.WilloSpirit(world).setBottomCenter(650, 2350),
                new e.WilloSpirit(world).setBottomCenter(1280, 1600),
            ],
            enemyPack(enemies(8, e.Ghost, world), new PIXI.Point(775, 2468), 500),
            enemyPack(enemies(4, e.Ghost, world), new PIXI.Point(775, 2147), 500),
            enemyPack(enemies(4, e.Skelly, world), new PIXI.Point(775, 2147), 500),
            enemyPack(enemies(8, e.Skelly, world), new PIXI.Point(775, 1802), 500),
        ),
        bgTrack: "/sounds/Foria - Break Away(eq).ogg",
        bgVolume: 1.5,
        foregroundAccents: (world) => [
            new GlowAccent(world).setBottomRight(1700, 2873),
            new GlowAccent(world).setBottomRight(1700, 1802),
        ],
    },

};

for (let name of Keys(mapData)) {
    mapData[name].mapName = name;
}

export default mapData;
