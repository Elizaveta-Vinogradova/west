import Card from "./Card";
import {getCreatureDescription} from "./index.js";

export class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions(){
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
            ];
    }
}