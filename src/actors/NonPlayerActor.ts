import Map from "../world/Map";
import Actor from "./Actor";
import Player from "./Player";

abstract class NonPlayerActor extends Actor {
    public abstract updateImpulse(map: Map, player?: Player): void;
}

export default NonPlayerActor;
