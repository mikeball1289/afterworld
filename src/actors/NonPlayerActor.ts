import {Map} from "../world/Map";
import {Actor} from "./Actor";
import {Player} from "./Player";

export abstract class NonPlayerActor extends Actor {
    public abstract updateImpulse(map: Map, player?: Player): void;
}
