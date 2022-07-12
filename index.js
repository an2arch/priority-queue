"use strict";
class DecQueue {
    constructor(list) {
        this.buffer = [];
        if (list) {
            this.buffer = list;
            for (let i = Math.floor(this.buffer.length / 2) - 1; i >= 0; --i) {
                this.SiftDown(i);
            }
        }
    }
    SiftDown(idx, trace) {
        if (trace)
            trace(this.buffer);
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
            if (trace)
                trace(this.buffer);
        }
    }
    SiftUp(idx, trace) {
        if (trace)
            trace(this.buffer);
        while (idx > 0) {
            let parent = Math.floor((idx - 1) / 2);
            if (this.buffer[parent] >= this.buffer[idx]) {
                return;
            }
            [this.buffer[parent], this.buffer[idx]] = [this.buffer[idx], this.buffer[parent]];
            idx = parent;
            if (trace)
                trace(this.buffer);
        }
    }
    Enqueue(item, trace) {
        if (trace)
            trace(this.buffer);
        this.buffer.push(item);
        this.SiftUp(this.buffer.length - 1, trace);
    }
    Dequeue(trace) {
        if (trace)
            trace(this.buffer);
        if (this.buffer.length === 0) {
            return null;
        }
        let result = this.buffer[0];
        if (this.buffer.length === 1) {
            this.buffer.pop();
            if (trace)
                trace(this.buffer);
            return result;
        }
        this.buffer[0] = this.buffer.pop();
        if (this.buffer.length > 0) {
            this.SiftDown(0, trace);
        }
        return result;
    }
    Peek() {
        if (this.buffer.length === 0) {
            return null;
        }
        return this.buffer[0];
    }
    GetBuffer() {
        return this.buffer;
    }
}
/*class HistoryContainer{
    private story: HTMLDivElement;
    constructor(story: HTMLDivElement) {
        this.story = story;
    }

    addToHistory(message: string): void {
        this.story.insertAdjacentHTML("afterbegin", `<div class="info-container">
            <div class="messages">${message}</div>
            <div class="time">${this.getCurrentTimeStr()}</div>
        </div>`)
    }

    private getCurrentTimeStr(): string {
        return new Date().toLocaleTimeString();
    }
}
class FunctionsContainer {
    private addButton: HTMLDivElement;
    private popButton: HTMLDivElement;
    private textBox: HTMLInputElement;
    private history: HistoryContainer;

    constructor(addButton: HTMLDivElement, popButton: HTMLDivElement, textBox: HTMLInputElement, story: HistoryContainer, queue: DecQueue) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.textBox = textBox;
        this.history = story;

        this.addButton.onclick = () => {
            this.handleAddItem(queue);
        };
        this.popButton.onclick = () =>{this.handlePopItem(queue)};
        this.textBox.onkeydown = (e) => {
            if (e.key === "Enter") this.handleAddItem(queue);
        };
    }

    handleAddItem(decQueue: DecQueue): void {
        if (!this.textBox.value) {
            this.textBox.style.borderColor = "#FF3030";
            return;
        }
        this.textBox.style.borderColor = "#000";

        const item = parseFloat(this.textBox.value);
        if (!isNaN(item)) {
            this.textBox.value = "";
            trace = [];
            decQueue.Enqueue(item, (s) => {
                trace.push([...s]);
            });
            this.history.addToHistory(`add ${item}`);
        }
    }

    handlePopItem(decQueue: DecQueue): void {
        trace = [];
        let result = decQueue.Dequeue((s) => {
            trace.push([...s]);
        });

        if (result === null) {
            alert("There are no items in a queue");
            return;
        }
        this.history.addToHistory(`pop ${result}`);
    }
}*/ 
/// <reference path="DecQueue.ts" />
function getPoint(canvas, point) {
    let rect = canvas.getBoundingClientRect(); // abs. size of element
    let scaleX = canvas.width / rect.width; // relationship bitmap vs. element for x
    let scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y
    return {
        x: Math.max(0, (point.x - rect.left) * scaleX),
        y: Math.max(0, (point.y - rect.top) * scaleY),
    };
}
function rectContainPoint(rectPos, rectWidth, rectHeight, point) {
    return (point.x >= rectPos.x &&
        point.x <= rectPos.x + rectWidth &&
        point.y >= rectPos.y &&
        point.y <= rectPos.y + rectHeight);
}
function drawLine(ctx, pointFrom, pointTo, color = null) {
    if (color) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(pointFrom.x, pointFrom.y);
    ctx.lineTo(pointTo.x, pointTo.y);
    ctx.stroke();
}
function getCurrentTimeStr() {
    return new Date().toLocaleTimeString();
}
class Item {
    constructor(value, level, pos) {
        this.value = value;
        this.level = level;
        this.canvasPos = pos;
    }
    drawLineToItem(ctx, other) {
        drawLine(ctx, this.canvasPos, other.canvasPos, Item.LINE_COLOR);
    }
    render(ctx) {
        let textWidth = ctx.measureText(String(this.value)).width;
        let textHeight = parseFloat(ctx.font.match(/\d+px/)[0]);
        let cx = this.canvasPos.x - textWidth / 2;
        let cy = this.canvasPos.y - textHeight / 2;
        ctx.fillStyle = Item.RECT_COLOR;
        ctx.fillRect(cx - Item.BOX_PADDING, cy - Item.BOX_PADDING, textWidth + 2 * Item.BOX_PADDING, textHeight + 2 * Item.BOX_PADDING);
        ctx.fillStyle = Item.TEXT_COLOR;
        ctx.fillText(String(this.value), cx, cy + textHeight / 2);
    }
}
Item.RECT_COLOR = "#E494AE";
Item.TEXT_COLOR = "#0F4844";
Item.LINE_COLOR = "#0F4844";
Item.BOX_PADDING = 10;
class QueueWidget {
    constructor(canvas) {
        this.ITEM_SPACING_X = 40;
        this.RESET_WIDTH = 110;
        this.RESET_HEIGTH = 30;
        this.currMatrix = new DOMMatrix();
        this.scale = 1;
        this.items = [];
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.initContext();
        this.updateSizes();
        this.canvas.onwheel = (e) => {
            this.handleScale(1.1, e.deltaY < 0, getPoint(canvas, { x: e.clientX, y: e.clientY }));
        };
        this.canvas.onmousemove = (e) => {
            let resetPos = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (rectContainPoint(resetPos, this.RESET_WIDTH, this.RESET_HEIGTH, getPoint(this.canvas, { x: e.clientX, y: e.clientY }))) {
                this.canvas.style.cursor = "pointer";
            }
            else {
                this.canvas.style.cursor = "move";
            }
        };
        let savedOnMouseMove = this.canvas.onmousemove;
        this.canvas.onmousedown = (e) => {
            let resetPos = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (rectContainPoint(resetPos, this.RESET_WIDTH, this.RESET_HEIGTH, getPoint(this.canvas, { x: e.clientX, y: e.clientY }))) {
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
        }, false);
    }
    update(queue) {
        let levelCount = Math.floor(Math.log2(queue.GetBuffer().length));
        this.items = [];
        for (let i = 0; i < queue.GetBuffer().length; ++i) {
            let levelCurrent = Math.floor(Math.log2(i + 1));
            let countChildren = Math.pow(2, levelCount - levelCurrent);
            let y = this.canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50;
            let x = i !== 0
                ? this.items[Math.ceil(i / 2) - 1].canvasPos.x -
                    Math.pow(-1, (i + 1) % 2) * this.ITEM_SPACING_X * countChildren
                : this.ctx.canvas.width / 2;
            this.items.push(new Item(queue.GetBuffer()[i], levelCurrent, { x, y }));
        }
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.setTransform(this.currMatrix);
        this.drawItems();
        this.ctx.restore();
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
    drawItems() {
        for (const [idx, item] of this.items.entries()) {
            let parrent = Math.floor((idx - 1) / 2);
            if (parrent >= 0) {
                item.drawLineToItem(this.ctx, this.items[parrent]);
            }
        }
        for (const item of this.items) {
            item.render(this.ctx);
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
class HistoryContainer {
    constructor(story) {
        this.story = story;
    }
    addToHistory(message) {
        this.story.insertAdjacentHTML("afterbegin", `<div class="info-container">
            <div class="messages">${message}</div>
            <div class="time">${this.getCurrentTimeStr()}</div>
        </div>`);
    }
    getCurrentTimeStr() {
        return new Date().toLocaleTimeString();
    }
}
class FunctionsContainer {
    constructor(addButton, popButton, textBox, story, queue) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.textBox = textBox;
        this.history = story;
        this.addButton.onclick = () => {
            this.handleAddItem(queue);
        };
        this.popButton.onclick = () => {
            this.handlePopItem(queue);
        };
        this.textBox.onkeydown = (e) => {
            if (e.key === "Enter")
                this.handleAddItem(queue);
        };
    }
    handleAddItem(decQueue) {
        if (!this.textBox.value) {
            this.textBox.style.borderColor = "#FF3030";
            return;
        }
        this.textBox.style.borderColor = "#000";
        const item = parseFloat(this.textBox.value);
        if (!isNaN(item)) {
            this.textBox.value = "";
            let trace = [];
            decQueue.Enqueue(item, (s) => {
                trace.push([...s]);
            });
            this.history.addToHistory(`add ${item}`);
        }
    }
    handlePopItem(decQueue) {
        let trace = [];
        let result = decQueue.Dequeue((s) => {
            trace.push([...s]);
        });
        if (result === null) {
            alert("There are no items in a queue");
            return;
        }
        this.history.addToHistory(`pop ${result}`);
    }
}
const canvas = document.getElementById("canvas");
const story = document.getElementById("overflow");
const textBox = document.getElementById("text-box");
const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");
const queue = new DecQueue();
let queueWidget = new QueueWidget(canvas);
let historyContainer = new HistoryContainer(story);
let funcContainer = new FunctionsContainer(addButton, popButton, textBox, historyContainer, queue);
function loop(time) {
    queueWidget.update(queue);
    queueWidget.render();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
