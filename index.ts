/// <reference path="DecQueue.ts" />

// TODO: this is a state variables
type HexColor = `#${string}`;
type Point = { x: number; y: number };
const ITEM_SPACING_X: number = 40;
const ITEM_BOX_PADDING: number = 10;
const queue: DecQueue = new DecQueue();

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const container: HTMLDivElement = document.getElementById("container") as HTMLDivElement;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const textBox = document.getElementById("text-box") as HTMLInputElement;
const addButton = document.getElementById("add-button") as HTMLDivElement;
const popButton = document.getElementById("pop-button") as HTMLDivElement;

function updateSizes(canvas: HTMLCanvasElement, container: HTMLDivElement, maxWidth: number, maxHeight: number) {
    canvas.width = (maxWidth * 3) / 4;
    canvas.height = maxHeight - 20;
    container.style.width = String(maxWidth / 4);
}

function initContext(ctx: CanvasRenderingContext2D): void {
    ctx.font = "18px RobotoBlack";
    ctx.textBaseline = "middle";
}

function drawLine(ctx: CanvasRenderingContext2D, pointFrom: Point, pointTo: Point, color: HexColor): void {
    if (color) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(pointFrom.x, pointFrom.y);
    ctx.lineTo(pointTo.x, pointTo.y);
    ctx.stroke();
}

function drawItem(
    ctx: CanvasRenderingContext2D,
    point: Point,
    item: number,
    rectColor: HexColor,
    textColor: HexColor
): void {
    let textWidth = ctx.measureText(String(item)).width;
    let textHeight = 18;

    let cx: number = point.x - textWidth / 2;
    let cy: number = point.y - textHeight / 2;

    ctx.fillStyle = rectColor;
    ctx.fillRect(
        cx - ITEM_BOX_PADDING,
        cy - ITEM_BOX_PADDING,
        textWidth + 2 * ITEM_BOX_PADDING,
        textHeight + 2 * ITEM_BOX_PADDING
    );

    ctx.fillStyle = textColor;
    ctx.fillText(String(item), cx, cy + textHeight / 2);
}

function drawItems(ctx: CanvasRenderingContext2D, items: number[]) {
    // TODO: this may be state variables
    let levelCount = Math.floor(Math.log2(items.length));
    let xs: number[] = [];
    let ys: number[] = [];

    for (let i = 0; i < items.length; ++i) {
        let levelCurrent = Math.floor(Math.log2(i + 1));
        ys.push(canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50);
        if (i == 0) {
            xs.push(canvas.width / 2);
        } else {
            let countChildren = Math.pow(2, levelCount - levelCurrent);
            xs.push(xs[Math.ceil(i / 2) - 1] - Math.pow(-1, (i + 1) % 2) * ITEM_SPACING_X * countChildren);
        }
    }

    for (let i = 0; i < items.length; ++i) {
        let parrent = Math.floor((i - 1) / 2);
        drawLine(ctx, { x: xs[i], y: ys[i] }, { x: xs[parrent], y: ys[parrent] }, "#0f4844");
    }
    for (let i = 0; i < items.length; ++i) {
        drawItem(ctx, { x: xs[i], y: ys[i] }, items[i], "#e494ae", "#0f4844");
    }
}

function handleAddItem(textBox: HTMLInputElement): void {
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

function handlePopItem(): void {
    trace = [];
    let result = queue.Dequeue((s) => {
        trace.push([...s]);
    });

    console.log(result);
    if (result === null) {
        alert("There are no items in a queue");
        return;
    }

    console.log(trace);
}

// TODO: this also may be state variables
let currMatrix: DOMMatrix = ctx.getTransform();
let scale: number = 1;
let trace: number[][] = [];

addButton.onclick = () => {
    handleAddItem(textBox);
};

popButton.onclick = handlePopItem;

textBox.onkeydown = (e) => {
    if (e.key === "Enter") handleAddItem(textBox);
};

function getPoint(canvas: HTMLCanvasElement, event: MouseEvent): Point {
    let rect: DOMRect = canvas.getBoundingClientRect(); // abs. size of element
    let scaleX: number = canvas.width / rect.width; // relationship bitmap vs. element for x
    let scaleY: number = canvas.height / rect.height; // relationship bitmap vs. element for y

    return {
        x: (event.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
        y: (event.clientY - rect.top) * scaleY, // been adjusted to be relative to element
    };
}

canvas.onwheel = (e: WheelEvent) => {
    let deltaScale = 1 - e.deltaY * 0.001;
    // let canvasRect = canvas.getBoundingClientRect();

    let pos: Point = getPoint(canvas, e);
    let imatrix: DOMMatrix = currMatrix.inverse();
    pos.x = pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e;
    pos.y = pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f;

    currMatrix.scaleSelf(deltaScale, deltaScale, 1, pos.x, pos.y);
    scale = Math.sqrt(currMatrix.a * currMatrix.a + currMatrix.b * currMatrix.b);
    if (scale < 0.125 || scale > 4) {
        currMatrix.scaleSelf(1 / deltaScale, 1 / deltaScale, 1, pos.x, pos.y);
        scale = Math.sqrt(currMatrix.a * currMatrix.a + currMatrix.b * currMatrix.b);
    }
};

canvas.onmousedown = () => {
    canvas.onmousemove = (e: MouseEvent) => {
        let offsetX: number = e.movementX;
        let offsetY: number = e.movementY;
        currMatrix.translateSelf(offsetX / scale, offsetY / scale);
    };

    canvas.onmouseup = () => {
        canvas.onmousemove = null;
        canvas.onmouseup = null;
    };
};

function loop(time: DOMHighResTimeStamp): void {
    for (let i = 0; i < trace.length; ++i) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.setTransform(currMatrix);
        drawItems(ctx, trace[i]);
        ctx.restore();
    }
    window.requestAnimationFrame(loop);
}

window.onload = () => {
    updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
    initContext(ctx);
    window.requestAnimationFrame(loop);
};

window.onresize = () => {
    updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
    initContext(ctx);
    window.requestAnimationFrame(loop);
};
