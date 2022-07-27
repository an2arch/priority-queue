import DrawableItem from "./DrawableItem.js";
import * as Utility from "./Utility.js";
import { DecQueue } from "./DecQueue.js";
class Snapshot {
    constructor(trace, queue) {
        this.trace = trace;
        this.queue = queue;
    }
}
export default class QueueWidget {
    constructor(canvas) {
        this.ITEM_SPACING_X = 40;
        this.RESET_WIDTH = 110;
        this.RESET_HEIGTH = 30;
        this.TRACE_INTERVAL = 0.5;
        this.currMatrix = new DOMMatrix();
        this.scale = 1;
        this.history = [];
        this.queue = new DecQueue();
        this.trace = [];
        this.traceTime = 0;
        this.drawing = false;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.initContext();
        this.updateSizes();
        this.canvas.onwheel = (e) => {
            this.handleScale(1.1, e.deltaY < 0, Utility.getPoint(canvas, { x: e.clientX, y: e.clientY }));
        };
        this.canvas.onmousemove = (e) => {
            let resetPos = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (Utility.rectContainPoint(resetPos, this.RESET_WIDTH, this.RESET_HEIGTH, Utility.getPoint(this.canvas, { x: e.clientX, y: e.clientY }))) {
                this.canvas.style.cursor = "pointer";
            }
            else {
                this.canvas.style.cursor = "move";
            }
        };
        let savedOnMouseMove = this.canvas.onmousemove;
        this.canvas.onmousedown = (e) => {
            let resetPos = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (Utility.rectContainPoint(resetPos, this.RESET_WIDTH, this.RESET_HEIGTH, Utility.getPoint(this.canvas, { x: e.clientX, y: e.clientY }))) {
                this.scale = 1;
                this.currMatrix = new DOMMatrix();
            }
            this.canvas.onmousemove = (e) => {
                let offsetX = e.movementX;
                let offsetY = e.movementY;
                let browserScale = window.devicePixelRatio;
                this.currMatrix.translateSelf(offsetX / (this.scale * browserScale), offsetY / (this.scale * browserScale));
            };
            this.canvas.onmouseup = () => {
                this.canvas.onmousemove = savedOnMouseMove;
                this.canvas.onmouseup = null;
            };
        };
        this.canvas.onmouseup = () => {
            this.canvas.onmousemove = savedOnMouseMove;
            this.canvas.onmouseup = null;
        };
        window.addEventListener("load", () => {
            this.updateSizes();
            this.initContext();
        }, false);
        window.addEventListener("resize", () => {
            this.updateSizes();
            this.initContext();
            for (let i = 0; i < this.trace.length; ++i) {
                this.trace[i] = this.updateItems(this.trace[i]);
            }
            console.log(this.trace);
        }, false);
    }
    Enqueue(item) {
        if (!this.drawing) {
            this.history.push(this.save());
            this.drawing = true;
            this.trace = [];
            this.traceTime = 0;
            let traceFunc = (s) => {
                this.trace.push(this.updateItems(s));
            };
            this.queue.Enqueue(item, traceFunc);
            this.queue = new DecQueue(this.updateItems(this.queue.buffer));
            return true;
        }
        return false;
    }
    Dequeue() {
        if (!this.drawing) {
            this.drawing = true;
            this.history.push(this.save());
            this.trace = [];
            this.traceTime = 0;
            let traceFunc = (s) => {
                this.trace.push(this.updateItems(s));
            };
            let result = this.queue.Dequeue(traceFunc);
            this.queue = new DecQueue(this.updateItems(this.queue.buffer));
            return result !== null && result !== void 0 ? result : true;
        }
        return false;
    }
    save() {
        return new Snapshot([...this.trace], this.queue.clone());
    }
    restore(s) {
        this.trace = [...s.trace];
        this.queue = s.queue.clone();
        this.traceTime = (this.trace.length - 1) * this.TRACE_INTERVAL;
    }
    undo() {
        if (!this.drawing && this.history.length > 0) {
            this.restore(this.history.pop());
            return true;
        }
        return false;
    }
    updateItems(items) {
        let levelCount = Math.floor(Math.log2(items.length));
        let newItems = [];
        for (let i = 0; i < items.length; ++i) {
            let newItem = new DrawableItem(items[i].priority);
            let levelCurrent = Math.floor(Math.log2(i + 1));
            let countChildren = Math.pow(2, levelCount - levelCurrent);
            let y = this.canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50;
            let x = i !== 0
                ? newItems[Math.ceil(i / 2) - 1].canvasPos.x -
                    Math.pow(-1, (i + 1) % 2) * this.ITEM_SPACING_X * countChildren
                : this.ctx.canvas.width / 2;
            newItem.level = levelCurrent;
            newItem.canvasPos = { x, y };
            newItem.id = items[i].id;
            newItems.push(newItem);
        }
        return newItems;
    }
    update(deltaTime) {
        if (this.drawing) {
            this.traceTime = this.traceTime + deltaTime;
            if (this.traceTime >= (this.trace.length - 1) * this.TRACE_INTERVAL) {
                this.traceTime = (this.trace.length - 1) * this.TRACE_INTERVAL;
                this.drawing = false;
            }
        }
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.trace.length > 0) {
            let idx = Math.floor(this.traceTime / this.TRACE_INTERVAL);
            let t = (this.traceTime % this.TRACE_INTERVAL) / this.TRACE_INTERVAL;
            this.ctx.save();
            this.ctx.setTransform(this.currMatrix);
            this.drawItems(this.trace[idx], this.trace[idx + 1], t);
            this.ctx.restore();
        }
        this.drawResetButton();
    }
    initContext() {
        this.ctx.font = "bold 18px OpenSans";
        this.ctx.textBaseline = "middle";
        this.ctx.resetTransform();
    }
    updateSizes() {
        let container = this.canvas.parentElement || document.documentElement;
        let savedDisplay = this.canvas.style.display;
        this.canvas.style.display = "none";
        let rect = container.getBoundingClientRect();
        let container_height = rect.height;
        let container_width = rect.width;
        let ratio = 4 / 3;
        let canvas_height = container_height;
        let canvas_width = canvas_height * ratio;
        if (canvas_width > container_width) {
            canvas_width = container_width;
            canvas_height = canvas_width / ratio;
        }
        this.canvas.width = canvas_width;
        this.canvas.height = canvas_height;
        this.canvas.style.display = savedDisplay;
    }
    drawItems(prevState, newState, t) {
        if (newState) {
            let easeInOutQuart = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
            for (const item of prevState) {
                let newItem = newState.find((i) => i.id === item.id);
                if (newItem) {
                    let currentItem = new DrawableItem(item.priority);
                    DrawableItem.resetId();
                    currentItem.canvasPos = Utility.lerpPoint(item.canvasPos, newItem.canvasPos, easeInOutQuart(t));
                    currentItem.id = item.id;
                    currentItem.render(this.ctx);
                }
                else {
                    item.render(this.ctx, easeInOutQuart(1 - t));
                }
            }
            for (const item of newState) {
                let newItem = prevState.find((i) => {
                    return i.id === item.id;
                });
                if (!newItem) {
                    item.render(this.ctx, easeInOutQuart(t));
                }
            }
        }
        else {
            for (const [idx, item] of prevState.entries()) {
                let parrent = Math.floor((idx - 1) / 2);
                if (parrent >= 0) {
                    item.drawLineToItem(this.ctx, prevState[parrent]);
                }
            }
            for (const item of prevState) {
                item.render(this.ctx);
            }
        }
    }
    drawResetButton() {
        this.ctx.fillStyle = "#FFF";
        let resetPos = { x: this.ctx.canvas.width - this.RESET_WIDTH, y: 0 };
        this.ctx.fillRect(resetPos.x, resetPos.y, this.RESET_WIDTH, this.RESET_HEIGTH);
        this.ctx.strokeRect(resetPos.x, resetPos.y, this.RESET_WIDTH, this.RESET_HEIGTH);
        let text = "Reset view";
        let textWidth = this.ctx.measureText(text).width;
        this.ctx.fillStyle = "#0f4844";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, resetPos.x + (this.RESET_WIDTH - textWidth) / 2, this.RESET_HEIGTH / 2);
    }
    handleScale(scaleMult, zoom, origin) {
        scaleMult = zoom ? scaleMult : 1 / scaleMult;
        let imatrix = this.currMatrix.inverse();
        origin.x = origin.x * imatrix.a + origin.y * imatrix.c + imatrix.e;
        origin.y = origin.x * imatrix.b + origin.y * imatrix.d + imatrix.f;
        if (this.scale * scaleMult >= 0.125 && this.scale * scaleMult <= 4) {
            this.currMatrix.scaleSelf(scaleMult, scaleMult, 1, origin.x, origin.y);
            this.scale *= scaleMult;
        }
    }
}
