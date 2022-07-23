import Item from "./Item.js";

export type traceFunc<T> = (a: T[]) => void;

export class DecQueue<T extends Item> {
    private m_buffer: T[] = [];

    constructor(list?: T[]) {
        if (list) {
            this.m_buffer = list;
            for (let i = Math.floor(this.m_buffer.length / 2) - 1; i >= 0; --i) {
                this.SiftDown(i);
            }
        }
    }

    private SiftDown(idx: number, trace?: traceFunc<T>): void {
        if (trace) trace(this.m_buffer);
        while (2 * idx + 1 < this.m_buffer.length) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let largest = left;
            if (right < this.m_buffer.length && this.m_buffer[right].greater(this.m_buffer[largest])) {
                largest = right;
            }
            if (this.m_buffer[largest].lessEq(this.m_buffer[idx])) {
                break;
            }
            [this.m_buffer[largest], this.m_buffer[idx]] = [this.m_buffer[idx], this.m_buffer[largest]];
            idx = largest;
            if (trace) trace(this.m_buffer);
        }
    }

    private SiftUp(idx: number, trace?: traceFunc<T>): void {
        if (trace) trace(this.m_buffer);
        while (idx > 0) {
            let parent = Math.floor((idx - 1) / 2);
            if (this.m_buffer[parent].greaterEq(this.m_buffer[idx])) {
                return;
            }
            [this.m_buffer[parent], this.m_buffer[idx]] = [this.m_buffer[idx], this.m_buffer[parent]];
            idx = parent;
            if (trace) trace(this.m_buffer);
        }
    }

    Enqueue(item: T, trace?: traceFunc<T>): void {
        if (trace) trace(this.m_buffer);
        this.buffer.push(item);
        this.SiftUp(this.m_buffer.length - 1, trace);
    }

    Dequeue(trace?: traceFunc<T>): T | null {
        if (trace) trace(this.m_buffer);

        if (this.m_buffer.length === 0) {
            return null;
        }

        let result = this.m_buffer[0];

        if (this.m_buffer.length === 1) {
            this.m_buffer.pop();
            if (trace) trace(this.m_buffer);
            return result;
        }

        this.m_buffer[0] = this.m_buffer.pop()!;

        if (this.m_buffer.length > 0) {
            this.SiftDown(0, trace);
        }

        return result;
    }

    Peek(): T | null {
        if (this.m_buffer.length === 0) {
            return null;
        }
        return this.m_buffer[0];
    }

    get buffer(): T[] {
        return this.m_buffer;
    }
}
