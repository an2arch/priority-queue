export default class Item {
    priority: number;
    constructor(priority: number) {
        this.priority = priority;
    }

    less(other: Item): boolean {
        return this.priority < other.priority;
    }
    lessEq(other: Item): boolean {
        return this.priority <= other.priority;
    }
    greater(other: Item): boolean {
        return this.priority > other.priority;
    }
    greaterEq(other: Item): boolean {
        return this.priority >= other.priority;
    }
}
