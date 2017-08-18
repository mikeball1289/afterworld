import Enemy from "../actors/Enemy";
import Skelly from "../actors/Skelly";
import World from "../world/World";

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
    npcs: INPCData[];
    enemies: (world: World) => Enemy[];
    entrances: {
        default: [number, number];
        [name: string]: [number, number];
    };
    exits: {[name: string]: [number, number]};
    bgTrack: string;
}

let p: <T>(x: T, y: T) => [T, T] = (x, y) => [x, y];

let mapData: { [mapname: string]: IMapDataObject } = {
    map1: {
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
                        "Did you know you can\ntalk to cool catz like me by pressing\nEnter on a keyboard or 'Y' on a gamepad?" +
                        "\n\nAlso why you naked?" }; },
            },
        ],
        enemies: (world: World) => {
            let enemies: Enemy[] = [];
            for (let i = 0; i < 10; i ++) {
                let skelly = new Skelly(world);
                skelly.x = 500 + Math.random() * 400;
                skelly.y = 1023 - skelly.size.y - 85;
                // skelly.x = 200 + Math.random() * 2800;
                // skelly.y = 200;
                enemies.push(skelly);
            }
            let skelly = new Skelly(world);
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
    map2: {
        map: "/maps/map2.png",
        background: "/maps/map2_back.png",
        entrances: {
            default: p(313, 259 - 85),
            map1: p(85, 464 - 85),
        },
        exits: {
            map1: p(85, 464 - 85),
        },
        npcs: [],
        enemies: () => {
            return [];
        },
        bgTrack: "/sounds/CarrotWine_How_to_spend_winter.ogg",
    },

    dark_forest1: {
        map: "/maps/dark_forest1_geometry.png",
        background: "/maps/dark_forest1_back.png",
        entrances: {
            default: p(144, 956 - 85),
        },
        exits: {},
        npcs: [],
        enemies: () => [],
        bgTrack: "/sounds/CarrotWine_How_to_spend_winter.ogg",
    },
};

export default mapData;
