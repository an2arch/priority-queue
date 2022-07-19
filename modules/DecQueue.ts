type traceFunc = (a: number[]) => void;
export default class DecQueue {
    private buffer: number[] = [];

    constructor(list?: number[]) {
        if (list) {
            this.buffer = list;
            for (let i = Math.floor(this.buffer.length / 2) - 1; i >= 0; --i) {
                this.SiftDown(i);
            }
        }
    }

    private SiftDown(idx: number, trace?: traceFunc): void {
        if (trace) trace(this.buffer);
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
            if (trace) trace(this.buffer);
        }
    }

    private SiftUp(idx: number, trace?: traceFunc): void {
        if (trace) trace(this.buffer);
        while (idx > 0) {
            let parent = Math.floor((idx - 1) / 2);
            if (this.buffer[parent] >= this.buffer[idx]) {
                return;
            }
            [this.buffer[parent], this.buffer[idx]] = [this.buffer[idx], this.buffer[parent]];
            idx = parent;
            if (trace) trace(this.buffer);
        }
    }

    Enqueue(item: number, trace?: traceFunc): void {
        if (trace) trace(this.buffer);
        this.buffer.push(item);
        this.SiftUp(this.buffer.length - 1, trace);
    }

    Dequeue(trace?: traceFunc): number | null {
        if (trace) trace(this.buffer);

        if (this.buffer.length === 0) {
            return null;
        }

        let result = this.buffer[0];

        if (this.buffer.length === 1) {
            this.buffer.pop();
            if (trace) trace(this.buffer);
            return result;
        }

        this.buffer[0] = this.buffer.pop()!;

        if (this.buffer.length > 0) {
            this.SiftDown(0, trace);
        }

        return result;
    }

    Peek(): number | null {
        if (this.buffer.length === 0) {
            return null;
        }
        return this.buffer[0];
    }

    GetBuffer(): number[] {
        return this.buffer;
    }
}
