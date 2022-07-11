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
/*class FunctionsContainer {
    private addButton: HTMLDivElement;
    private popButton: HTMLDivElement;
    private textBox: HTMLInputElement;
    private story: HTMLDivElement;
    private queue: DecQueue = new DecQueue();

    constructor(addButton: HTMLDivElement, popButton: HTMLDivElement, textBox: HTMLInputElement, story: HTMLDivElement) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.textBox = textBox;
        this.story = story;

        this.addButton.onclick = () => {
            this.handleAddItem();
        };
        this.popButton.onclick = this.handlePopItem;
        this.textBox.onkeydown = (e) => {
            if (e.key === "Enter") this.handleAddItem();
        };
    }


    addToHistory(message: string): void {
        this.story.insertAdjacentHTML("afterbegin", `<div class="info-container">
            <div class="messages">${message}</div>
            <div class="time">${this.getCurrentTimeStr()}</div>
        </div>`)
    }

    handleAddItem(): void {
        if (!this.textBox.value) {
            this.textBox.style.borderColor = "#FF3030";
            return;
        }
        this.textBox.style.borderColor = "#000";

        const item = parseFloat(this.textBox.value);
        if (!isNaN(item)) {
            this.textBox.value = "";
            trace = [];
            this.queue.Enqueue(item, (s) => {
                trace.push([...s]);
            });
            this.addToHistory(`add ${item}`);
        }
    }

    handlePopItem(): void {
        trace = [];
        let result = this.queue.Dequeue((s) => {
            trace.push([...s]);
        });

        if (result === null) {
            alert("There are no items in a queue");
            return;
        }
        this.addToHistory(`pop ${result}`);
    }

    private getCurrentTimeStr(): string {
        return new Date().toLocaleTimeString();
    }
}*/ 
/// <reference path="DecQueue.ts" />
/// <reference path="FunctionsContainer.ts"/>
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
        this.popButton.onclick = () => { this.handlePopItem(queue); };
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
            trace = [];
            decQueue.Enqueue(item, (s) => {
                trace.push([...s]);
            });
            this.history.addToHistory(`add ${item}`);
        }
    }
    handlePopItem(decQueue) {
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
}
// TODO: state variables
const ITEM_SPACING_X = 40;
const ITEM_BOX_PADDING = 10;
const RESET_WIDTH = 110;
const RESET_HEIGTH = 30;
const RESET_POS = { x: 0, y: 0 };
const queue = new DecQueue();
let currMatrix = new DOMMatrix();
let scale = 1;
let trace = [];
const canvas_container = document.getElementById("canvas-container");
const canvas = document.getElementById("canvas");
const story = document.getElementById("overflow");
const ctx = canvas.getContext("2d");
const textBox = document.getElementById("text-box");
const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");
const historyContainer = new HistoryContainer(story);
const funcContainer = new FunctionsContainer(addButton, popButton, textBox, historyContainer, queue);
function initContext(ctx) {
    ctx.font = "bold 18px OpenSans";
    ctx.textBaseline = "middle";
    ctx.resetTransform();
}
function updateSizes(canvas) {
    let container = canvas.parentElement || document.documentElement;
    canvas.style.display = "none";
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
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    canvas.style.display = "block";
    RESET_POS.x = canvas.width - RESET_WIDTH;
}
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
function drawLine(ctx, pointFrom, pointTo, color) {
    if (color) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(pointFrom.x, pointFrom.y);
    ctx.lineTo(pointTo.x, pointTo.y);
    ctx.stroke();
}
function drawItem(ctx, point, item, rectColor, textColor) {
    let textWidth = ctx.measureText(String(item)).width;
    let textHeight = 18;
    let cx = point.x - textWidth / 2;
    let cy = point.y - textHeight / 2;
    ctx.fillStyle = rectColor;
    ctx.fillRect(cx - ITEM_BOX_PADDING, cy - ITEM_BOX_PADDING, textWidth + 2 * ITEM_BOX_PADDING, textHeight + 2 * ITEM_BOX_PADDING);
    ctx.fillStyle = textColor;
    ctx.fillText(String(item), cx, cy + textHeight / 2);
}
function drawItems(ctx, items) {
    // TODO: this may be state variables
    let levelCount = Math.floor(Math.log2(items.length));
    let positions = [];
    for (let i = 0; i < items.length; ++i) {
        let levelCurrent = Math.floor(Math.log2(i + 1));
        let countChildren = Math.pow(2, levelCount - levelCurrent);
        let y = canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50;
        let x = i !== 0
            ? positions[Math.ceil(i / 2) - 1].x - Math.pow(-1, (i + 1) % 2) * ITEM_SPACING_X * countChildren
            : ctx.canvas.width / 2;
        positions[i] = { x, y };
    }
    for (let i = 0; i < items.length; ++i) {
        let parrent = Math.floor((i - 1) / 2);
        if (parrent >= 0) {
            drawLine(ctx, positions[i], positions[parrent], "#0f4844");
        }
    }
    for (let i = 0; i < items.length; ++i) {
        drawItem(ctx, positions[i], items[i], "#e494ae", "#0f4844");
    }
}
function drawResetButton(ctx) {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(RESET_POS.x, RESET_POS.y, RESET_WIDTH, RESET_HEIGTH);
    ctx.strokeRect(RESET_POS.x, RESET_POS.y, RESET_WIDTH, RESET_HEIGTH);
    let text = "Reset view";
    let textWidth = ctx.measureText(text).width;
    ctx.fillStyle = "#0f4844";
    ctx.textBaseline = "middle";
    ctx.fillText(text, RESET_POS.x + (RESET_WIDTH - textWidth) / 2, RESET_HEIGTH / 2);
}
function handleScale(scaleMult, zoom, origin) {
    scaleMult = zoom ? scaleMult : 1 / scaleMult;
    let imatrix = currMatrix.inverse();
    origin.x = origin.x * imatrix.a + origin.y * imatrix.c + imatrix.e;
    origin.y = origin.x * imatrix.b + origin.y * imatrix.d + imatrix.f;
    if (scale * scaleMult >= 0.125 && scale * scaleMult <= 4) {
        currMatrix.scaleSelf(scaleMult, scaleMult, 1, origin.x, origin.y);
        scale *= scaleMult;
    }
}
canvas.onwheel = (e) => {
    handleScale(1.1, e.deltaY < 0, getPoint(canvas, { x: e.clientX, y: e.clientY }));
};
canvas.onmousemove = (e) => {
    if (rectContainPoint(RESET_POS, RESET_WIDTH, RESET_HEIGTH, getPoint(canvas, { x: e.clientX, y: e.clientY }))) {
        canvas.style.cursor = "pointer";
    }
    else {
        canvas.style.cursor = "move";
    }
};
let savedOnMouseMove = canvas.onmousemove;
canvas.onmousedown = (e) => {
    if (rectContainPoint(RESET_POS, RESET_WIDTH, RESET_HEIGTH, getPoint(canvas, { x: e.clientX, y: e.clientY }))) {
        scale = 1;
        currMatrix = new DOMMatrix();
    }
    canvas.onmousemove = (e) => {
        let offsetX = e.movementX;
        let offsetY = e.movementY;
        currMatrix.translateSelf(offsetX / scale, offsetY / scale);
    };
    canvas.onmouseup = () => {
        canvas.onmousemove = savedOnMouseMove;
        canvas.onmouseup = null;
    };
};
canvas.onmouseup = () => {
    canvas.onmousemove = savedOnMouseMove;
    canvas.onmouseup = null;
};
function loop(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawResetButton(ctx);
    for (let i = 0; i < trace.length; ++i) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.setTransform(currMatrix);
        drawItems(ctx, trace[i]);
        ctx.restore();
        drawResetButton(ctx);
    }
    window.requestAnimationFrame(loop);
}
window.addEventListener("load", () => {
    updateSizes(canvas);
    initContext(ctx);
    window.requestAnimationFrame(loop);
}, false);
window.addEventListener("resize", () => {
    updateSizes(canvas);
    initContext(ctx);
    window.requestAnimationFrame(loop);
}, false);
