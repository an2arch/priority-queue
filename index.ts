/// <reference path="DecQueue.ts" />

type HexColor = `#${string}`;
type Point = { x: number; y: number };

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

function getCurrentTimeStr(): string {
    return new Date().toLocaleTimeString();
}

class QueueWidget {
    private readonly ITEM_SPACING_X: number = 40;
    private readonly ITEM_BOX_PADDING: number = 10;
    private readonly RESET_WIDTH: number = 110;
    private readonly RESET_HEIGTH: number = 30;
    private readonly queue: DecQueue = new DecQueue();
    private currMatrix: DOMMatrix = new DOMMatrix();
    private scale: number = 1;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.initContext();
        this.updateSizes();

        this.canvas.onwheel = (e: WheelEvent) => {
            this.handleScale(1.1, e.deltaY < 0, getPoint(canvas, { x: e.clientX, y: e.clientY }));
        };

        this.canvas.onmousemove = (e: MouseEvent) => {
            let resetPos: Point = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (
                rectContainPoint(
                    resetPos,
                    this.RESET_WIDTH,
                    this.RESET_HEIGTH,
                    getPoint(this.canvas, { x: e.clientX, y: e.clientY })
                )
            ) {
                this.canvas.style.cursor = "pointer";
            } else {
                this.canvas.style.cursor = "move";
            }
        };

        let savedOnMouseMove = this.canvas.onmousemove;

        this.canvas.onmousedown = (e: MouseEvent) => {
            let resetPos: Point = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (
                rectContainPoint(
                    resetPos,
                    this.RESET_WIDTH,
                    this.RESET_HEIGTH,
                    getPoint(this.canvas, { x: e.clientX, y: e.clientY })
                )
            ) {
                this.scale = 1;
                this.currMatrix = new DOMMatrix();
            }

            this.canvas.onmousemove = (e: MouseEvent) => {
                let offsetX: number = e.movementX;
                let offsetY: number = e.movementY;
                this.currMatrix.translateSelf(offsetX / this.scale, offsetY / this.scale);
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

        window.addEventListener(
            "load",
            () => {
                this.updateSizes();
                this.initContext();
            },
            false
        );

        window.addEventListener(
            "resize",
            () => {
                this.updateSizes();
                this.initContext();
            },
            false
        );
    }

    addItem(value: number): void {
        this.queue.Enqueue(value);
    }

    popItem(): number | undefined {
        let result = this.queue.Dequeue();
        return result !== null ? result : undefined;
    }

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawResetButton();
        this.ctx.save();
        this.ctx.setTransform(this.currMatrix);
        this.drawItems();
        this.ctx.restore();
    }

    private initContext(): void {
        this.ctx.font = "bold 18px OpenSans";
        this.ctx.textBaseline = "middle";
        this.ctx.resetTransform();
    }

    private updateSizes() {
        let container: HTMLElement = this.canvas.parentElement || document.documentElement;
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

    private drawItem(point: Point, item: number, rectColor: HexColor, textColor: HexColor): void {
        let textWidth = this.ctx.measureText(String(item)).width;
        let textHeight = 18;

        let cx: number = point.x - textWidth / 2;
        let cy: number = point.y - textHeight / 2;

        this.ctx.fillStyle = rectColor;
        this.ctx.fillRect(
            cx - this.ITEM_BOX_PADDING,
            cy - this.ITEM_BOX_PADDING,
            textWidth + 2 * this.ITEM_BOX_PADDING,
            textHeight + 2 * this.ITEM_BOX_PADDING
        );

        this.ctx.fillStyle = textColor;
        this.ctx.fillText(String(item), cx, cy + textHeight / 2);
    }

    private drawItems() {
        let items = this.queue.GetBuffer();

        // TODO: this may be state variables
        let levelCount = Math.floor(Math.log2(items.length));
        let positions: Point[] = [];

        for (let i = 0; i < items.length; ++i) {
            let levelCurrent = Math.floor(Math.log2(i + 1));
            let countChildren = Math.pow(2, levelCount - levelCurrent);
            let y = this.canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50;
            let x =
                i !== 0
                    ? positions[Math.ceil(i / 2) - 1].x -
                      Math.pow(-1, (i + 1) % 2) * this.ITEM_SPACING_X * countChildren
                    : this.ctx.canvas.width / 2;
            positions[i] = { x, y };
        }

        for (let i = 0; i < items.length; ++i) {
            let parrent = Math.floor((i - 1) / 2);
            if (parrent >= 0) {
                drawLine(this.ctx, positions[i], positions[parrent], "#0f4844");
            }
        }
        for (let i = 0; i < items.length; ++i) {
            this.drawItem(positions[i], items[i], "#e494ae", "#0f4844");
        }
    }

    private drawResetButton() {
        this.ctx.fillStyle = "#FFF";
        let resetPos: Point = { x: this.ctx.canvas.width - this.RESET_WIDTH, y: 0 };
        this.ctx.fillRect(resetPos.x, resetPos.y, this.RESET_WIDTH, this.RESET_HEIGTH);
        this.ctx.strokeRect(resetPos.x, resetPos.y, this.RESET_WIDTH, this.RESET_HEIGTH);

        let text: string = "Reset view";
        let textWidth: number = this.ctx.measureText(text).width;
        this.ctx.fillStyle = "#0f4844";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, resetPos.x + (this.RESET_WIDTH - textWidth) / 2, this.RESET_HEIGTH / 2);
    }

    private handleScale(scaleMult: number, zoom: boolean, origin: Point) {
        scaleMult = zoom ? scaleMult : 1 / scaleMult;

        let imatrix: DOMMatrix = this.currMatrix.inverse();
        origin.x = origin.x * imatrix.a + origin.y * imatrix.c + imatrix.e;
        origin.y = origin.x * imatrix.b + origin.y * imatrix.d + imatrix.f;

        if (this.scale * scaleMult >= 0.125 && this.scale * scaleMult <= 4) {
            this.currMatrix.scaleSelf(scaleMult, scaleMult, 1, origin.x, origin.y);
            this.scale *= scaleMult;
        }
    }
}

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const story: HTMLDivElement = document.getElementById("overflow") as HTMLDivElement;
const textBox = document.getElementById("text-box") as HTMLInputElement;
const addButton = document.getElementById("add-button") as HTMLDivElement;
const popButton = document.getElementById("pop-button") as HTMLDivElement;

let queueWidget = new QueueWidget(canvas);

function addToHistory(message: string): void {
    story.insertAdjacentHTML(
        "afterbegin",
        `<div class="info-container">
        <div class="messages">${message}</div>
        <div class="time">${getCurrentTimeStr()}</div>
    </div>`
    );
}

function addItemHandle(): void {
    if (!textBox.value) {
        textBox.style.borderColor = "#FF3030";
        return;
    }
    textBox.style.borderColor = "#000";

    const item = parseFloat(textBox.value);
    if (!isNaN(item)) {
        textBox.value = "";
        queueWidget.addItem(item);
        addToHistory(`add ${item}`);
    }
}

addButton.onclick = addItemHandle;

popButton.onclick = () => {
    let result = queueWidget.popItem();

    if (result === undefined) {
        alert("There are no items in a queue");
        return;
    }

    addToHistory(`pop ${result}`);
};

textBox.onkeydown = (e) => {
    if (e.key === "Enter") addItemHandle();
};

function loop(time: DOMHighResTimeStamp) {
    queueWidget.render();
    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
