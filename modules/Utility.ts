export type HexColor = `#${string}`;
export type Point = { x: number; y: number };

export function clamp(x: number, min: number, max: number): number {
    return Math.max(min, Math.min(x, max));
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function lerpPoint(a: Point, b: Point, t: number): Point {
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function getPoint(canvas: HTMLCanvasElement, point: Point): Point {
    let rect: DOMRect = canvas.getBoundingClientRect(); // abs. size of element
    let scaleX: number = canvas.width / rect.width; // relationship bitmap vs. element for x
    let scaleY: number = canvas.height / rect.height; // relationship bitmap vs. element for y

    return {
        x: Math.max(0, (point.x - rect.left) * scaleX),
        y: Math.max(0, (point.y - rect.top) * scaleY),
    };
}

export function rectContainPoint(rectPos: Point, rectWidth: number, rectHeight: number, point: Point): boolean {
    return (
        point.x >= rectPos.x &&
        point.x <= rectPos.x + rectWidth &&
        point.y >= rectPos.y &&
        point.y <= rectPos.y + rectHeight
    );
}

export function drawLine(
    ctx: CanvasRenderingContext2D,
    pointFrom: Point,
    pointTo: Point,
    color: HexColor | null = null
): void {
    if (color) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(pointFrom.x, pointFrom.y);
    ctx.lineTo(pointTo.x, pointTo.y);
    ctx.stroke();
}

export function getCurrentTimeStr(): string {
    return new Date().toLocaleTimeString();
}
