/// <reference path="DecQueue.ts" />

type HexColor = `#${string}`;
type Point = { x: number; y: number };

// TODO: state variables
const ITEM_SPACING_X: number = 40;
const ITEM_BOX_PADDING: number = 10;
const RESET_WIDTH = 110;
const RESET_HEIGTH = 30;
const RESET_POS: Point = { x: 0, y: 0 };
const queue: DecQueue = new DecQueue();
let currMatrix: DOMMatrix = new DOMMatrix();
let scale: number = 1;
let trace: number[][] = [];

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const container: HTMLDivElement = document.getElementById("functions-container") as HTMLDivElement;
const storybox: HTMLDivElement = document.getElementById("overflow") as HTMLDivElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const textBox = document.getElementById("text-box") as HTMLInputElement;
const addButton = document.getElementById("add-button") as HTMLDivElement;
const popButton = document.getElementById("pop-button") as HTMLDivElement;

function initContext(ctx: CanvasRenderingContext2D): void {
    ctx.font = "bold 18px OpenSans";
    ctx.textBaseline = "middle";
    ctx.resetTransform();
}

function updateSizes(canvas: HTMLCanvasElement, container: HTMLDivElement, maxWidth: number, maxHeight: number) {
    canvas.width = (maxWidth * 3) / 4;
    canvas.height = maxHeight - 20;
    container.style.width = String(maxWidth / 4);
    RESET_POS.x = canvas.width - RESET_WIDTH;
}

function getPoint(canvas: HTMLCanvasElement, point: Point): Point {
    let rect: DOMRect = canvas.getBoundingClientRect(); // abs. size of element
    let scaleX: number = canvas.width / rect.width; // relationship bitmap vs. element for x
    let scaleY: number = canvas.height / rect.height; // relationship bitmap vs. element for y

    return {
        x: Math.max(0, (point.x - rect.left) * scaleX),
        y: Math.max(0, (point.y - rect.top) * scaleY),
    };
}

function rectContainPoint(rectPos: Point, rectWidth: number, rectHeight: number, point: Point): boolean {
    return (
        point.x >= rectPos.x &&
        point.x <= rectPos.x + rectWidth &&
        point.y >= rectPos.y &&
        point.y <= rectPos.y + rectHeight
    );
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
    let positions: Point[] = [];

    for (let i = 0; i < items.length; ++i) {
        let levelCurrent = Math.floor(Math.log2(i + 1));
        let countChildren = Math.pow(2, levelCount - levelCurrent);
        let y = canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50;
        let x =
            i !== 0
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

function drawResetButton(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(RESET_POS.x, RESET_POS.y, RESET_WIDTH, RESET_HEIGTH);
    ctx.strokeRect(RESET_POS.x, RESET_POS.y, RESET_WIDTH, RESET_HEIGTH);

    let text: string = "Reset view";
    let textWidth: number = ctx.measureText(text).width;
    ctx.fillStyle = "#0f4844";
    ctx.textBaseline = "middle";
    ctx.fillText(text, RESET_POS.x + (RESET_WIDTH - textWidth) / 2, RESET_HEIGTH / 2);
}

function getCurrentTimeStr(): string {
    return new Date().toLocaleTimeString();
}

function addToHistory(message: string): void {
    storybox.insertAdjacentHTML("afterbegin",
        `<div class="info-container">
                            <div class="messages">${message}</div>
                            <div class="time">${new Date().toLocaleTimeString()}</div>
                        </div>`);

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
        addToHistory(`add ${item}`);
    }
}

function handlePopItem(): void {
    trace = [];
    let result = queue.Dequeue((s) => {
        trace.push([...s]);
    });

    if (result === null) {
        alert("There are no items in a queue");
        return;
    }
    addToHistory(`pop ${result}`);
    console.log(trace);
}

function handleScale(scaleMult: number, zoom: boolean, origin: Point) {
    scaleMult = zoom ? scaleMult : 1 / scaleMult;

    let imatrix: DOMMatrix = currMatrix.inverse();
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
    if (e.key === "Enter") handleAddItem(textBox);
};

canvas.onwheel = (e: WheelEvent) => {
    handleScale(1.1, e.deltaY < 0, getPoint(canvas, { x: e.clientX, y: e.clientY }));
};

canvas.onmousemove = (e: MouseEvent) => {
    if (rectContainPoint(RESET_POS, RESET_WIDTH, RESET_HEIGTH, getPoint(canvas, { x: e.clientX, y: e.clientY }))) {
        canvas.style.cursor = "pointer";
    } else {
        canvas.style.cursor = "move";
    }
};

let savedOnMouseMove = canvas.onmousemove;

canvas.onmousedown = (e: MouseEvent) => {
    if (rectContainPoint(RESET_POS, RESET_WIDTH, RESET_HEIGTH, getPoint(canvas, { x: e.clientX, y: e.clientY }))) {
        scale = 1;
        currMatrix = new DOMMatrix();
    }

    canvas.onmousemove = (e: MouseEvent) => {
        let offsetX: number = e.movementX;
        let offsetY: number = e.movementY;
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

function loop(time: DOMHighResTimeStamp): void {
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

window.addEventListener(
    "load",
    () => {
        updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
        initContext(ctx);
        window.requestAnimationFrame(loop);
    },
    false
);

window.addEventListener(
    "resize",
    () => {
        updateSizes(canvas, container, document.documentElement.clientWidth, document.documentElement.clientHeight);
        initContext(ctx);
        window.requestAnimationFrame(loop);
    },
    false
);
