import Enemy from "../actors/Enemy";
import Skelly from "../actors/Skelly";
import World from "../world/World";

export interface INPCData {
    name: string;
    image: string;
    position: { x: number, y: number };
    text: string;
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
}

let p: (x: number, y: number) => [number, number] = (x, y) => [x, y];

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
                    y: 1172,
                },
                text: "Hey hey cool cat. I'm John, the coolest\nguy in these parts. Did you know you can\ntalk to cool catz like me by pressing\nEnter on a keyboard or 'Y' on a gamepad?"
                        + "\n\nAlso why you naked?",
            },
        ],
        enemies: (world: World) => {
            let enemies: Enemy[] = [];
            for (let i = 0; i < 10; i ++) {
                let skelly = new Skelly(world);
                skelly.x = 500 + Math.random() * 400;
                skelly.y = 1023 - skelly.size.y;
                // skelly.x = 200 + Math.random() * 2800;
                // skelly.y = 200;
                enemies.push(skelly);
            }
            return enemies;
        },
        entrances: {
            default: p(1112, 955),
            map2: p(2890, 1158),
        },
        exits: {
            map2: p(2890, 1158),
        },
    },
    map2: {
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
    },
};

export default mapData;
