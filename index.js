"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DecQueue = /** @class */ (function () {
    function DecQueue(list) {
        this.buffer = [];
        if (list) {
            this.buffer = list;
            for (var i = Math.floor(this.buffer.length / 2) - 1; i >= 0; --i) {
                this.SiftDown(i);
            }
        }
    }
    DecQueue.prototype.SiftDown = function (idx, trace) {
        var _a;
        if (trace)
            trace(this.buffer);
        while (2 * idx + 1 < this.buffer.length) {
            var left = 2 * idx + 1;
            var right = 2 * idx + 2;
            var largest = left;
            if (right < this.buffer.length && this.buffer[right] > this.buffer[largest]) {
                largest = right;
            }
            if (this.buffer[largest] <= this.buffer[idx]) {
                break;
            }
            _a = [this.buffer[idx], this.buffer[largest]], this.buffer[largest] = _a[0], this.buffer[idx] = _a[1];
            idx = largest;
            if (trace)
                trace(this.buffer);
        }
    };
    DecQueue.prototype.SiftUp = function (idx, trace) {
        var _a;
        if (trace)
            trace(this.buffer);
        while (idx > 0) {
            var parent_1 = Math.floor((idx - 1) / 2);
            if (this.buffer[parent_1] >= this.buffer[idx]) {
                return;
            }
            _a = [this.buffer[idx], this.buffer[parent_1]], this.buffer[parent_1] = _a[0], this.buffer[idx] = _a[1];
            idx = parent_1;
            if (trace)
                trace(this.buffer);
        }
    };
    DecQueue.prototype.Enqueue = function (item, trace) {
        if (trace)
            trace(this.buffer);
        this.buffer.push(item);
        this.SiftUp(this.buffer.length - 1, trace);
    };
    DecQueue.prototype.Dequeue = function (trace) {
        if (trace)
            trace(this.buffer);
        if (this.buffer.length === 0) {
            return null;
        }
        var result = this.buffer[0];
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
    };
    DecQueue.prototype.Peek = function () {
        if (this.buffer.length === 0) {
            return null;
        }
        return this.buffer[0];
    };
    DecQueue.prototype.GetBuffer = function () {
        return this.buffer;
    };
    return DecQueue;
}());
/// <reference path="DecQueue.ts" />
var ITEM_SPACING_X = 40;
var ITEM_BOX_PADDING = 10;
var queue = new DecQueue();
var canvas = document.getElementById("canvas");
var container = document.getElementById("container");
var ctx = canvas.getContext("2d");
var textBox = document.getElementById("text-box");
var addButton = document.getElementById("add-button");
var popButton = document.getElementById("pop-button");
function updateSizes(canvas, container, maxWidth, maxHeight) {
    canvas.width = (maxWidth * 3) / 4;
    canvas.height = maxHeight - 20;
    container.style.width = String(maxWidth / 4);
}
function initContext(ctx) {
    ctx.font = "18px RobotoBlack";
    ctx.textBaseline = "middle";
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
    var textWidth = ctx.measureText(String(item)).width;
    var textHeight = 18;
    var cx = point.x - textWidth / 2;
    var cy = point.y - textHeight / 2;
    ctx.fillStyle = rectColor;
    ctx.fillRect(cx - ITEM_BOX_PADDING, cy - ITEM_BOX_PADDING, textWidth + 2 * ITEM_BOX_PADDING, textHeight + 2 * ITEM_BOX_PADDING);
    ctx.fillStyle = textColor;
    ctx.fillText(String(item), cx, cy + textHeight / 2);
}
function drawItems(ctx, items) {
    // TODO: this may be state variables
    var levelCount = Math.floor(Math.log2(items.length));
    var xs = [];
    var ys = [];
    for (var i = 0; i < items.length; ++i) {
        var levelCurrent = Math.floor(Math.log2(i + 1));
        ys.push(canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50);
        if (i == 0) {
            xs.push(canvas.width / 2);
        }
        else {
            var countChildren = Math.pow(2, levelCount - levelCurrent);
            xs.push(xs[Math.ceil(i / 2) - 1] - Math.pow(-1, (i + 1) % 2) * ITEM_SPACING_X * countChildren);
        }
    }
    for (var i = 0; i < items.length; ++i) {
        var parrent = Math.floor((i - 1) / 2);
        drawLine(ctx, { x: xs[i], y: ys[i] }, { x: xs[parrent], y: ys[parrent] }, "#0f4844");
    }
    for (var i = 0; i < items.length; ++i) {
        drawItem(ctx, { x: xs[i], y: ys[i] }, items[i], "#e494ae", "#0f4844");
    }
}
function handleAddItem(textBox) {
    if (!textBox.value) {
        textBox.style.borderColor = "#FF3030";
        textBox.style.borderWidth = "2px";
        return;
    }
    textBox.style.borderColor = "#000";
    textBox.style.borderWidth = "1px";
    var item = parseFloat(textBox.value);
    if (!isNaN(item)) {
        textBox.value = "";
        trace = [];
        queue.Enqueue(item, function (s) {
            trace.push(__spreadArray([], s, true));
        });
        console.log(trace);
    }
}
function handlePopItem() {
    trace = [];
    var result = queue.Dequeue(function (s) {
        trace.push(__spreadArray([], s, true));
    });
    console.log(result);
    if (result === null) {
        alert("There are no items in a queue");
        return;
    }
    console.log(trace);
}
// TODO: this also may be state variables
var currMatrix = ctx.getTransform();
var scale = 1;
var trace = [];
addButton.onclick = function () {
    handleAddItem(textBox);
};
popButton.onclick = handlePopItem;
textBox.onkeydown = function (e) {
    if (e.key === "Enter")
        handleAddItem(textBox);
};
function getPoint(canvas, event) {
    var rect = canvas.getBoundingClientRect(); // abs. size of element
    var scaleX = canvas.width / rect.width; // relationship bitmap vs. element for x
    var scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY, // been adjusted to be relative to element
    };
}
canvas.onwheel = function (e) {
    var deltaScale = 1 - e.deltaY * 0.001;
    // let canvasRect = canvas.getBoundingClientRect();
    var pos = getPoint(canvas, e);
    var imatrix = currMatrix.inverse();
    pos.x = pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e;
    pos.y = pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f;
    currMatrix.scaleSelf(deltaScale, deltaScale, 1, pos.x, pos.y);
    scale = Math.sqrt(currMatrix.a * currMatrix.a + currMatrix.b * currMatrix.b);
    if (scale < 0.125 || scale > 4) {
        currMatrix.scaleSelf(1 / deltaScale, 1 / deltaScale, 1, pos.x, pos.y);
        scale = Math.sqrt(currMatrix.a * currMatrix.a + currMatrix.b * currMatrix.b);
    }
};
canvas.onmousedown = function () {
    canvas.onmousemove = function (e) {
        var offsetX = e.movementX;
        var offsetY = e.movementY;
        currMatrix.translateSelf(offsetX / scale, offsetY / scale);
    };
    canvas.onmouseup = function () {
        canvas.onmousemove = null;
        canvas.onmouseup = null;
    };
};
function loop(time) {
    for (var i = 0; i < trace.length; ++i) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.setTransform(currMatrix);
        drawItems(ctx, trace[i]);
        ctx.restore();
    }
    window.requestAnimationFrame(loop);
}
window.onload = function () {
    updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
    initContext(ctx);
    window.requestAnimationFrame(loop);
};
window.onresize = function () {
    updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
    initContext(ctx);
    window.requestAnimationFrame(loop);
};
