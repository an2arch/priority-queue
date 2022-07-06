const canvas = document.getElementById("canvas");
canvas.width = (document.documentElement.clientWidth * 3) / 4;
canvas.height = canvas.height = document.documentElement.clientHeight - 20;

const container = document.getElementById("container");
container.width = document.documentElement.clientWidth / 4;

const ctx = canvas.getContext("2d");

const textBox = document.getElementById("text-box");
const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");

const ITEM_SPACING_X = 40;
const ITEM_BOX_PADDING = 10;
const queue = new DecQueue();

function initContext(context) {
    context.font = "18px RobotoBlack";
    context.textAllign = "center";
    context.textBaseline = "middle";
}

function drawLine(ctx, pointFrom, pointTo, color) {
    if (color) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(...pointFrom);
    ctx.lineTo(...pointTo);
    ctx.stroke();
}

function drawItem(ctx, point, item, rectColor, textColor) {
    let metrics = ctx.measureText(item);
    let textHeight = 18;

    let cx = point[0] - metrics.width / 2;
    let cy = point[1] - textHeight / 2;

    ctx.fillStyle = rectColor;
    ctx.fillRect(
        cx - ITEM_BOX_PADDING,
        cy - ITEM_BOX_PADDING,
        metrics.width + 2 * ITEM_BOX_PADDING,
        textHeight + 2 * ITEM_BOX_PADDING
    );

    ctx.fillStyle = textColor;
    ctx.fillText(item, cx, cy + textHeight / 2);
}

function drawItems(ctx, items) {
    let xs = [];
    let ys = [];
    let levelCount = Math.floor(Math.log2(items.length));
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
        drawLine(ctx, [xs[i], ys[i]], [xs[parrent], ys[parrent]], "#0f4844");
    }
    for (let i = 0; i < items.length; ++i) {
        drawItem(ctx, [xs[i], ys[i]], items[i], "#e494ae", "#0f4844");
    }
}

initContext(ctx);

let trace = [];
addButton.onclick = () => {
    const item = parseFloat(textBox.value);
    if (!isNaN(item)) {
        textBox.value = "";
        trace = [];
        queue.Enqueue(item, (s) => {
            trace.push([...s]);
        });
        console.log(trace);
    }
};

textBox.onkeydown = (e) => {
    const ENTER = 13;
    if (e.keyCode == ENTER) addButton.onclick();
};

function loop(time) {
    for (let i = 0; i < trace.length; ++i) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawItems(ctx, trace[i]);
    }
    window.requestAnimationFrame(loop);
}

window.onresize = () => {
    canvas.width = (document.documentElement.clientWidth * 3) / 4;
    canvas.height = canvas.height = document.documentElement.clientHeight - 20;
    container.width = document.documentElement.clientWidth / 4;
    initContext(ctx);
    window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);
