export function clamp(x, min, max) {
    return Math.max(min, Math.min(x, max));
}
export function lerp(a, b, t) {
    return a + (b - a) * t;
}
export function lerpPoint(a, b, t) {
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}
export function getPoint(canvas, point) {
    let rect = canvas.getBoundingClientRect(); // abs. size of element
    let scaleX = canvas.width / rect.width; // relationship bitmap vs. element for x
    let scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y
    return {
        x: Math.max(0, (point.x - rect.left) * scaleX),
        y: Math.max(0, (point.y - rect.top) * scaleY),
    };
}
export function rectContainPoint(rectPos, rectWidth, rectHeight, point) {
    return (point.x >= rectPos.x &&
        point.x <= rectPos.x + rectWidth &&
        point.y >= rectPos.y &&
        point.y <= rectPos.y + rectHeight);
}
export function drawLine(ctx, pointFrom, pointTo, color = null) {
    if (color) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(pointFrom.x, pointFrom.y);
    ctx.lineTo(pointTo.x, pointTo.y);
    ctx.stroke();
}
export function getCurrentTimeStr() {
    return new Date().toLocaleTimeString();
}
