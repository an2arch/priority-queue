import * as Utility from "./Utility.js";
import Item from "./Item.js";
export default class DrawableItem extends Item {
    constructor(value) {
        super(value);
        this.level = -1;
        this.canvasPos = { x: 0, y: 0 };
        this.canvasPosStr = { x: 0, y: 0 };
        this.id = Item.ID_GENERATOR++;
    }
    drawLineToItem(ctx, other) {
        Utility.drawLine(ctx, this.canvasPos, other.canvasPos, DrawableItem.LINE_COLOR);
    }
    render(ctx, transparency) {
        let textWidth = ctx.measureText(String(this.priority)).width;
        let textHeight = parseFloat(ctx.font.match(/\d+px/)[0]);
        let cx = this.canvasPos.x - textWidth / 2;
        let cy = this.canvasPos.y - textHeight / 2;
        ctx.fillStyle = DrawableItem.RECT_COLOR;
        if (transparency) {
            ctx.fillStyle += ("00" + Math.floor(transparency * 255).toString(16)).slice(-2);
        }
        ctx.fillRect(cx - DrawableItem.BOX_PADDING, cy - DrawableItem.BOX_PADDING, textWidth + 2 * DrawableItem.BOX_PADDING, textHeight + 2 * DrawableItem.BOX_PADDING);
        ctx.fillStyle = DrawableItem.TEXT_COLOR;
        if (transparency) {
            ctx.fillStyle += ("00" + Math.floor(transparency * 255).toString(16)).slice(-2);
        }
        ctx.fillText(String(this.priority), cx, cy + textHeight / 2);
    }
    stringRender(ctx, transparency) {
        let textWidth = ctx.measureText(String(this.priority)).width;
        let textHeight = parseFloat(ctx.font.match(/\d+px/)[0]);
        let cx = this.canvasPosStr.x;
        let cy = this.canvasPosStr.y - textHeight / 2;
        if (transparency) {
            ctx.fillStyle += ("00" + Math.floor(transparency * 255).toString(16)).slice(-2);
        }
        ctx.fillStyle = DrawableItem.TEXT_COLOR;
        if (transparency) {
            ctx.fillStyle += ("00" + Math.floor(transparency * 255).toString(16)).slice(-2);
        }
        ctx.fillText(String(this.priority), cx, cy + textHeight / 2);
    }
}
DrawableItem.RECT_COLOR = "#E494AE";
DrawableItem.TEXT_COLOR = "#0F4844";
DrawableItem.LINE_COLOR = "#0F4844";
DrawableItem.BOX_PADDING = 10;
