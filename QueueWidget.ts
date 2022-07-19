import DrawableItem from "./DrawableItem.js";
import * as Utility from "./Utility.js";
import DecQueue from "./DecQueue.js";

export default class QueueWidget {
    private readonly ITEM_SPACING_X: number = 40;
    private readonly RESET_WIDTH: number = 110;
    private readonly RESET_HEIGTH: number = 30;
    private currMatrix: DOMMatrix = new DOMMatrix();
    private scale: number = 1;

    private items: DrawableItem[] = [];

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        this.initContext();
        this.updateSizes();

        this.canvas.onwheel = (e: WheelEvent) => {
            this.handleScale(1.1, e.deltaY < 0, Utility.getPoint(canvas, { x: e.clientX, y: e.clientY }));
        };

        this.canvas.onmousemove = (e: MouseEvent) => {
            let resetPos: Utility.Point = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (
                Utility.rectContainPoint(
                    resetPos,
                    this.RESET_WIDTH,
                    this.RESET_HEIGTH,
                    Utility.getPoint(this.canvas, { x: e.clientX, y: e.clientY })
                )
            ) {
                this.canvas.style.cursor = "pointer";
            } else {
                this.canvas.style.cursor = "move";
            }
        };

        let savedOnMouseMove = this.canvas.onmousemove;

        this.canvas.onmousedown = (e: MouseEvent) => {
            let resetPos: Utility.Point = { x: this.canvas.width - this.RESET_WIDTH, y: 0 };
            if (
                Utility.rectContainPoint(
                    resetPos,
                    this.RESET_WIDTH,
                    this.RESET_HEIGTH,
                    Utility.getPoint(this.canvas, { x: e.clientX, y: e.clientY })
                )
            ) {
                this.scale = 1;
                this.currMatrix = new DOMMatrix();
            }

            this.canvas.onmousemove = (e: MouseEvent) => {
                let offsetX: number = e.movementX;
                let offsetY: number = e.movementY;

                let browserScale = window.devicePixelRatio;

                this.currMatrix.translateSelf(
                    offsetX / (this.scale * browserScale),
                    offsetY / (this.scale * browserScale)
                );
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

    update(queue: DecQueue): void {
        let levelCount = Math.floor(Math.log2(queue.GetBuffer().length));
        this.items = [];

        for (let i = 0; i < queue.GetBuffer().length; ++i) {
            let levelCurrent = Math.floor(Math.log2(i + 1));
            let countChildren = Math.pow(2, levelCount - levelCurrent);

            let y = this.canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50;
            let x =
                i !== 0
                    ? this.items[Math.ceil(i / 2) - 1].canvasPos.x -
                      Math.pow(-1, (i + 1) % 2) * this.ITEM_SPACING_X * countChildren
                    : this.ctx.canvas.width / 2;

            this.items.push(new DrawableItem(queue.GetBuffer()[i], levelCurrent, { x, y }));
        }
    }

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.setTransform(this.currMatrix);
        this.drawItems();
        this.ctx.restore();
        this.drawResetButton();
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

    private drawItems() {
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

    private drawResetButton() {
        this.ctx.fillStyle = "#FFF";
        let resetPos: Utility.Point = { x: this.ctx.canvas.width - this.RESET_WIDTH, y: 0 };
        this.ctx.fillRect(resetPos.x, resetPos.y, this.RESET_WIDTH, this.RESET_HEIGTH);
        this.ctx.strokeRect(resetPos.x, resetPos.y, this.RESET_WIDTH, this.RESET_HEIGTH);

        let text: string = "Reset view";
        let textWidth: number = this.ctx.measureText(text).width;
        this.ctx.fillStyle = "#0f4844";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, resetPos.x + (this.RESET_WIDTH - textWidth) / 2, this.RESET_HEIGTH / 2);
    }

    private handleScale(scaleMult: number, zoom: boolean, origin: Utility.Point) {
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
