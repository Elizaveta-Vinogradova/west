import Card from "./Card";
import {getCreatureDescription} from "./index";

export default class Creature extends Card {
    getDescriptions(){
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
            ];
    }
}