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
/// <reference path="DecQueue.ts" />
// TODO: state variables
const ITEM_SPACING_X = 40;
const ITEM_BOX_PADDING = 10;
const RESET_WIDTH = 100;
const RESET_HEIGTH = 30;
const RESET_POS = { x: 0, y: 0 };
const queue = new DecQueue();
let currMatrix = new DOMMatrix();
let scale = 1;
let trace = [];
const canvas = document.getElementById("canvas");
const container = document.getElementById("container");
const ctx = canvas.getContext("2d");
const textBox = document.getElementById("text-box");
const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");
function initContext(ctx) {
    ctx.font = "18px RobotoBlack";
    ctx.textBaseline = "middle";
    ctx.resetTransform();
}
function updateSizes(canvas, container, maxWidth, maxHeight) {
    canvas.width = (maxWidth * 3) / 4;
    canvas.height = maxHeight - 20;
    container.style.width = String(maxWidth / 4);
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
function handleAddItem(textBox) {
    if (!textBox.value) {
        textBox.style.borderColor = "#FF3030";
        textBox.style.borderWidth = "2px";
        return;
    }
    textBox.style.borderColor = "#000";
    textBox.style.borderWidth = "1px";
    const item = parseFloat(textBox.value);
    if (!isNaN(item)) {
        textBox.value = "";
        trace = [];
        queue.Enqueue(item, (s) => {
            trace.push([...s]);
        });
        console.log(trace);
    }
}
function handlePopItem() {
    trace = [];
    let result = queue.Dequeue((s) => {
        trace.push([...s]);
    });
    console.log("Pop item: ", result);
    if (result === null) {
        alert("There are no items in a queue");
        return;
    }
    console.log(trace);
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
addButton.onclick = () => {
    handleAddItem(textBox);
};
popButton.onclick = handlePopItem;
textBox.onkeydown = (e) => {
    if (e.key === "Enter")
        handleAddItem(textBox);
};
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
    updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
    initContext(ctx);
    window.requestAnimationFrame(loop);
}, false);
window.addEventListener("resize", () => {
    updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
    initContext(ctx);
    window.requestAnimationFrame(loop);
}, false);
