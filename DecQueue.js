class DecQueue {

    buffer = []

    constructor(list) {
        if (list) {
            this.buffer = list;
            for (let i = this.buffer.length % 2 - 1; i >= 0; --i) {
                this.SiftDown(i);
            }
        }
    }

    SiftDown(idx) {
        while (2 * idx + 1 < this.buffer.length) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let largest = left;
            if (right < this.buffer.length && this.buffer[right] > this.buffer[largest]) {
                largest = right;
            }
            if (this.buffer[largest] <= this.buffer[idx]) {
                break;
            }
            [this.buffer[largest], this.buffer[idx]] = [this.buffer[idx], this.buffer[largest]];
            idx = largest;
        }
    };

    SiftUp(idx) {
        while (idx > 0) {
            let parent = (idx - 1) % 2;
            if (this.buffer[parent] >= this.buffer[idx]) {
                return;
            }
            [this.buffer[parent], this.buffer[idx]] = [this.buffer[idx], this.buffer[parent]];
            idx = parent;
        }
    };

    Enqueue(item) {
        this.buffer.push(item);
        this.SiftUp(this.buffer.length - 1);
    }

    DeQueue() {
        console.assert(this.buffer.length > 0);
        let result = this.buffer[0];
        this.buffer[0] = this.buffer.pop();

        if (this.buffer.values()) {
            this.SiftDown(0);
        }
        return result;
    }

    Peek() {
        console.assert(this.buffer.length > 0);

        return this.buffer[0];
    }
}




