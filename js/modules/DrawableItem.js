import * as Utility from "./Utility.js";
import Item from "./Item.js";
export default class DrawableItem extends Item {
    constructor(value) {
        // , level: number, pos: Utility.Point) {
        super(value);
        // value: number;
        this.level = -1;
        this.canvasPos = { x: 0, y: 0 };
        // this.value = value;
        // this.level = level;
        // this.canvasPos = pos;
    }
    drawLineToItem(ctx, other) {
        Utility.drawLine(ctx, this.canvasPos, other.canvasPos, DrawableItem.LINE_COLOR);
    }
    render(ctx) {
        let textWidth = ctx.measureText(String(this.priority)).width;
        let textHeight = parseFloat(ctx.font.match(/\d+px/)[0]);
        let cx = this.canvasPos.x - textWidth / 2;
        let cy = this.canvasPos.y - textHeight / 2;
        ctx.fillStyle = DrawableItem.RECT_COLOR;
        ctx.fillRect(cx - DrawableItem.BOX_PADDING, cy - DrawableItem.BOX_PADDING, textWidth + 2 * DrawableItem.BOX_PADDING, textHeight + 2 * DrawableItem.BOX_PADDING);
        ctx.fillStyle = DrawableItem.TEXT_COLOR;
        ctx.fillText(String(this.priority), cx, cy + textHeight / 2);
    }
}
DrawableItem.RECT_COLOR = "#E494AE";
DrawableItem.TEXT_COLOR = "#0F4844";
DrawableItem.LINE_COLOR = "#0F4844";
DrawableItem.BOX_PADDING = 10;
