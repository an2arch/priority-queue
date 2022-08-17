export default class Item {
    public static ID_GENERATOR: number = 0;

    priority: number;
    constructor(priority: number) {
        this.priority = priority;
    }

    static resetId(): void {
        Item.ID_GENERATOR--;
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
