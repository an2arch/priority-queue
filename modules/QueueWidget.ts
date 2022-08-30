import DrawableItem from "./DrawableItem.js";
import * as Utility from "./Utility.js";
import {DecQueue} from "./DecQueue.js";

class Snapshot {
    trace: DrawableItem[][];
    queue: DecQueue<DrawableItem>;

    constructor(trace: DrawableItem[][], queue: DecQueue<DrawableItem>) {
        this.trace = trace;
        this.queue = queue;
    }
}

class CurrentQueue {
    private currentQueue: HTMLDivElement;

    constructor(currentQueue: HTMLDivElement) {
        this.currentQueue = currentQueue;
    }

    clear(): void {
        let deleteElements = this.currentQueue.querySelectorAll('span');
        deleteElements.forEach(element => element.remove());
    }

    update(elements: DecQueue<DrawableItem>): void {
        this.clear();

        elements.buffer.forEach(element => {
            this.currentQueue.insertAdjacentHTML(
                'afterbegin',
                `<span>${element}</span> `)
        })
    }
}

export default class QueueWidget {
    private static readonly ITEM_SPACING_X: number = 40;
    private static readonly RESET_WIDTH: number = 110;
    private static readonly RESET_HEIGTH: number = 30;

    private static readonly TITLE_WIDTH: number = 330;
    private static readonly TITLE_HEIGHT: number = 90;

    private currMatrix: DOMMatrix = new DOMMatrix();
    private currMatrixInsideView: DOMMatrix = new DOMMatrix();
    private insideViewLength: number = 0;

    private scale: number = 1;

    private history: Snapshot[] = [];
    private queue: DecQueue<DrawableItem> = new DecQueue<DrawableItem>();
    private trace: DrawableItem[][] = [];
    private traceTime: number = 0;
    private m_traceInterval: number = 0.5;
    private drawing: boolean = false;

    private canvas: HTMLCanvasElement;
    private canvasInsideView: HTMLCanvasElement;

    private ctx: CanvasRenderingContext2D;
    private ctxInsideView: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, canvasInsideView: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvasInsideView = canvasInsideView;

        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctxInsideView = this.canvasInsideView.getContext("2d") as CanvasRenderingContext2D;

        this.initContext();
        this.updateSizes();

        this.canvas.onwheel = (e: WheelEvent) => {
            this.handleScale(1.1, e.deltaY < 0, Utility.getPoint(canvas, {x: e.clientX, y: e.clientY}));
        };

        this.canvas.onmousemove = (e: MouseEvent) => {
            let resetPos: Utility.Point = {x: this.canvas.width - QueueWidget.RESET_WIDTH, y: 0};
            if (
                Utility.rectContainPoint(
                    resetPos,
                    QueueWidget.RESET_WIDTH,
                    QueueWidget.RESET_HEIGTH,
                    Utility.getPoint(this.canvas, {x: e.clientX, y: e.clientY})
                )
            ) {
                this.canvas.style.cursor = "pointer";
            } else {
                this.canvas.style.cursor = "move";
            }
        };

        let savedOnMouseMove = this.canvas.onmousemove;

        this.canvas.onmousedown = (e: MouseEvent) => {
            let resetPos: Utility.Point = {x: this.canvas.width - QueueWidget.RESET_WIDTH, y: 0};
            if (
                Utility.rectContainPoint(
                    resetPos,
                    QueueWidget.RESET_WIDTH,
                    QueueWidget.RESET_HEIGTH,
                    Utility.getPoint(this.canvas, {x: e.clientX, y: e.clientY})
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
                for (let i = 0; i < this.trace.length; ++i) {
                    this.trace[i] = this.updateItems(this.trace[i]);
                }
            },
            false
        );

        this.canvasInsideView.onwheel = (e: WheelEvent) => {

            const SPEED = 2;

            let browserScale = window.devicePixelRatio;
            let offsetY: number = e.clientY;
            let step: number = offsetY / e.deltaY * browserScale * SPEED;

            this.currMatrixInsideView.translateSelf(
                -step,
                0
            );

            if(this.currMatrixInsideView.e > 0) this.currMatrixInsideView.e = 0;

            console.log(-this.canvasInsideView.width);
            console.log(-this.insideViewLength);
            console.log(this.currMatrixInsideView);
        };
    }

    Enqueue(item: DrawableItem) {
        if (!this.drawing) {
            this.history.push(this.save());
            this.drawing = true;
            this.trace = [];
            this.traceTime = 0;
            let traceFunc = (s: DrawableItem[]) => {
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
            let traceFunc = (s: DrawableItem[]) => {
                this.trace.push(this.updateItems(s));
            };
            let result = this.queue.Dequeue(traceFunc);
            this.queue = new DecQueue(this.updateItems(this.queue.buffer));
            return result ?? true;
        }
        return false;
    }

    set traceInterval(newTraceInterval: number) {
        let savedTraceInterval = this.m_traceInterval;
        this.m_traceInterval = newTraceInterval;
        this.traceTime *= newTraceInterval / savedTraceInterval;
    }

    private save(): Snapshot {
        return new Snapshot([...this.trace], this.queue.clone());
    }

    private restore(s: Snapshot): void {
        this.trace = [...s.trace];
        this.queue = s.queue.clone();
        this.traceTime = (this.trace.length - 1) * this.m_traceInterval;
    }

    undo(): boolean {
        if (!this.drawing && this.history.length > 0) {
            this.restore(this.history.pop()!);
            return true;
        }
        return false;
    }

    updateItems(items: DrawableItem[]): DrawableItem[] {
        let levelCount = Math.floor(Math.log2(items.length));
        let newItems = [];
        let STEP: number = 20;
        this.insideViewLength = 0;

        for (let i = 0; i < items.length; ++i) {
            let newItem: DrawableItem = new DrawableItem(items[i].priority);

            let levelCurrent = Math.floor(Math.log2(i + 1));
            let countChildren = Math.pow(2, levelCount - levelCurrent);

            let y = this.canvas.height / 2 - (levelCount * 50) / 2 + levelCurrent * 50;
            let x =
                i !== 0
                    ? newItems[Math.ceil(i / 2) - 1].canvasPos.x -
                    Math.pow(-1, (i + 1) % 2) * QueueWidget.ITEM_SPACING_X * countChildren
                    : this.ctx.canvas.width / 2;

            let yStr: number = this.canvasInsideView.height / 2;
            let xStr: number = STEP;
            this.insideViewLength += STEP;


            STEP += this.ctxInsideView.measureText(newItem.priority.toString()).width + 20;

            newItem.level = levelCurrent;
            newItem.canvasPos = {x, y};
            newItem.canvasPosStr = {x: xStr, y: yStr};
            newItem.id = items[i].id;

            newItems.push(newItem);
        }
        return newItems;
    }


    update(deltaTime: number): void {
        if (this.drawing) {
            this.traceTime = this.traceTime + deltaTime;
            if (this.traceTime >= (this.trace.length - 1) * this.m_traceInterval) {
                this.traceTime = (this.trace.length - 1) * this.m_traceInterval;
                this.drawing = false;
            }
        }
    }

    private drawInsideViewTitle()
    {
        let title: string = 'Inside View';
        let titleLength: number = this.ctxInsideView.measureText(title).width;
        this.ctxInsideView.fillText(title, this.canvasInsideView.width /2 - titleLength, 10);
    }
    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctxInsideView.clearRect(0, 0, this.canvasInsideView.width, this.canvasInsideView.height);

        if (this.trace.length > 0) {
            let idx = Math.floor(this.traceTime / this.m_traceInterval);
            let t = (this.traceTime % this.m_traceInterval) / this.m_traceInterval;
            this.ctx.save();
            this.ctxInsideView.save();
            this.ctx.setTransform(this.currMatrix);
            this.ctxInsideView.setTransform(this.currMatrixInsideView);
            this.drawItems(this.trace[idx], this.trace[idx + 1], t);
            this.drawItemsStr(this.trace[idx], this.trace[idx + 1], t);
            this.ctx.restore();
            this.ctxInsideView.restore();
        }
        this.drawInsideViewTitle();
        this.drawResetButton();
    }

    private initContext(): void {
        this.ctx.font = "bold 18px OpenSans";
        this.ctx.textBaseline = "middle";
        this.ctx.resetTransform();

        this.ctxInsideView.font = "bold 18px OpenSans";
        this.ctxInsideView.textBaseline = "middle";
        this.ctxInsideView.resetTransform();
    }

    private updateSizes() {
        let container: HTMLElement = this.canvas.parentElement || document.documentElement;
        let savedDisplay = this.canvas.style.display;
        this.canvas.style.display = "none";

        let savedDisplayInsideView = this.canvasInsideView.style.display;
        this.canvasInsideView.style.display = "none";

        let rect = container.getBoundingClientRect();
        let container_height = rect.height;
        let container_width = rect.width;

        let ratio = 4 / 3;

        let canvas_height = container_height*9/10;
        let canvas_width = container_width;

        if (canvas_width > container_width) {
            canvas_width = container_width;
            canvas_height = canvas_width / ratio *9/10;
        }

        let canvasInsideView_height = container_height/11;
        let canvasInsideView_width = canvas_width;

        this.canvas.width = canvas_width;
        this.canvas.height = canvas_height;
        this.canvas.style.display = savedDisplay;

        this.canvasInsideView.width = canvasInsideView_width;
        this.canvasInsideView.height = canvasInsideView_height;
        this.canvasInsideView.style.display = savedDisplayInsideView;
    }

    private drawItemsStr(prevState: DrawableItem[], newState: DrawableItem[] | undefined, t: number) {
        if (newState) {
            let easeInOutQuart = (x: number) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
            for (const item of prevState) {
                let newItem = newState.find((i: DrawableItem) => i.id === item.id);

                if (newItem) {
                    let currentItem = new DrawableItem(item.priority);

                    DrawableItem.resetId();
                    currentItem.canvasPosStr = Utility.lerpPoint(item.canvasPosStr, newItem.canvasPosStr, easeInOutQuart(t));
                    currentItem.id = item.id;
                    currentItem.stringRender(this.ctxInsideView);
                } else {
                    item.stringRender(this.ctxInsideView, easeInOutQuart(1 - t));
                }
            }
            for (const item of newState) {
                let newItem = prevState.find((i: DrawableItem) => {
                    return i.id === item.id;
                });
                if (!newItem) {
                    item.stringRender(this.ctxInsideView, easeInOutQuart(t));
                }
            }
        } else {
            for (const item of prevState) {
                item.stringRender(this.ctxInsideView);
            }
        }
    }

    private drawItems(prevState: DrawableItem[], newState: DrawableItem[] | undefined, t: number) {
        if (newState) {
            let easeInOutQuart = (x: number) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
            for (const item of prevState) {
                let newItem = newState.find((i: DrawableItem) => i.id === item.id);

                if (newItem) {
                    let currentItem = new DrawableItem(item.priority);

                    DrawableItem.resetId();
                    currentItem.canvasPos = Utility.lerpPoint(item.canvasPos, newItem.canvasPos, easeInOutQuart(t));
                    currentItem.id = item.id;
                    currentItem.render(this.ctx);
                } else {
                    item.render(this.ctx, easeInOutQuart(1 - t));
                }
            }
            for (const item of newState) {
                let newItem = prevState.find((i: DrawableItem) => {
                    return i.id === item.id;
                });
                if (!newItem) {
                    item.render(this.ctx, easeInOutQuart(t));
                }
            }
        } else {
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

    private drawResetButton() {
        this.ctx.fillStyle = "#FFF";
        let resetPos: Utility.Point = {x: this.ctx.canvas.width - QueueWidget.RESET_WIDTH, y: 0};
        this.ctx.fillRect(resetPos.x, resetPos.y, QueueWidget.RESET_WIDTH, QueueWidget.RESET_HEIGTH);
        this.ctx.strokeRect(resetPos.x, resetPos.y, QueueWidget.RESET_WIDTH, QueueWidget.RESET_HEIGTH);

        let text: string = "Reset view";
        let textWidth: number = this.ctx.measureText(text).width;
        this.ctx.fillStyle = "#0f4844";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, resetPos.x + (QueueWidget.RESET_WIDTH - textWidth) / 2, QueueWidget.RESET_HEIGTH / 2);
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
