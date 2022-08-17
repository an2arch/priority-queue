export default class Item {
    constructor(priority) {
        this.priority = priority;
    }
    static resetId() {
        Item.ID_GENERATOR--;
    }
    less(other) {
        return this.priority < other.priority;
    }
    lessEq(other) {
        return this.priority <= other.priority;
    }
    greater(other) {
        return this.priority > other.priority;
    }
    greaterEq(other) {
        return this.priority >= other.priority;
    }
}
Item.ID_GENERATOR = 0;
