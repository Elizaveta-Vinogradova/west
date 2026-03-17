import Game from './Game.js';
import SpeedRate from './SpeedRate.js';
import Card from "./Card.js";
import TaskQueue from "./TaskQueue.js";


// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    getDescriptions(){
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

class Duck extends Creature
{
    constructor(name = "Мирная утка", power = 2) {
        super(name, power);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Dog extends Creature
{
    constructor(name = "Пес-бандит", power = 3) {
        super(name, power);
    }
}

class Gatling extends Creature {
    constructor(name = "Гатлинг", power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const card = oppositePlayer.table[position];
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(this.maxPower, gameContext, onDone);
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name = "Браток", power = 2) {
        super(name, power);
    }

    static getInGameCount() {
        return this.getInGameCount || 0;
    }

    static setInGameCount(value) {
        this.getInGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    static getBonus(){
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value + bonus);
        });
    }

    modifyTakenDamage(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value - bonus);
        });
    }

    getDescriptions() {
        let descriptions = [];
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            descriptions.push('Чем их больше, тем они сильнее');
        }
        return [...descriptions, ...super.getDescriptions()];
    }
}
// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

class Trasher extends Dog{
    constructor(name="Громила", maxPower = 5) {
        super(name, maxPower);
    }

    modifyTakenDamage(value, toCard, gameContext, continuation) {
        if (value === 2){
            this.view.signalAbility(() => {
                this.view.signalAbility(()=> continuation(value - 1))
            })
            return;
        }
        continuation(value - 1);
    }
}

// Основа для утки.
// function Duck() {
//     this.quacks = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }


// Основа для собаки.
// function Dog() {
// }


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Lad(),
    new Dog(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});


