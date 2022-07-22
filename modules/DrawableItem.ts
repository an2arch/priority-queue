import * as Utility from "./Utility.js";
import Item from "./Item.js";

export default class DrawableItem extends Item {
    private static readonly RECT_COLOR: Utility.HexColor = "#E494AE";
    private static readonly TEXT_COLOR: Utility.HexColor = "#0F4844";
    private static readonly LINE_COLOR: Utility.HexColor = "#0F4844";
    private static readonly BOX_PADDING: number = 10;
    // value: number;
    level: number = -1;
    canvasPos: Utility.Point = { x: 0, y: 0 };

    constructor(value: number) {
        // , level: number, pos: Utility.Point) {
        super(value);
        // this.value = value;
        // this.level = level;
        // this.canvasPos = pos;
    }

    drawLineToItem(ctx: CanvasRenderingContext2D, other: DrawableItem) {
        Utility.drawLine(ctx, this.canvasPos, other.canvasPos, DrawableItem.LINE_COLOR);
    }

    render(ctx: CanvasRenderingContext2D) {
        let textWidth = ctx.measureText(String(this.priority)).width;
        let textHeight = parseFloat(ctx.font.match(/\d+px/)![0]);

        let cx: number = this.canvasPos.x - textWidth / 2;
        let cy: number = this.canvasPos.y - textHeight / 2;

        ctx.fillStyle = DrawableItem.RECT_COLOR;
        ctx.fillRect(
            cx - DrawableItem.BOX_PADDING,
            cy - DrawableItem.BOX_PADDING,
            textWidth + 2 * DrawableItem.BOX_PADDING,
            textHeight + 2 * DrawableItem.BOX_PADDING
        );

        ctx.fillStyle = DrawableItem.TEXT_COLOR;
        ctx.fillText(String(this.priority), cx, cy + textHeight / 2);
    }
}
