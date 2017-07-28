export interface MapDataObject {
    map: string;
    entrances: {
        default: [number, number];
        [name: string]: [number, number];
    };
    exits: {[name: string]: [number, number]};
}

let p: (x: number, y: number) => [number, number] = (x, y) => [x, y];

let mapData = {
    map1: {
        map: "/images/map.png",
        entrances: {
            default: p(1112, 955),
            map2: p(3052, 1067),
        },
        exits: {
            map2: p(3052, 1117),
        }
    },
    map2: {
        map: "/images/map2.png",
        entrances: {
            default: p(313, 259),
            map1: p(70, 410),
        },
        exits: {
            map1: p(70, 460),
        }
    }
}

export default mapData;