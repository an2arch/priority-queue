const canvas = document.getElementById("canvas");
canvas.width = (document.documentElement.clientWidth * 4) / 5;
canvas.height = document.documentElement.clientHeight - 20;

const ctx = canvas.getContext("2d");

const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");

const ITEM_SPACING = 40;
const ITEM_BOX_PADDING = 10;
const queue = new DecQueue();

function initContext(context) {
  context.font = "18px RobotoBlack";
  context.textAllign = "center";
  context.textBaseline = "middle";
}

function drawItem(context, x, y, item) {
  context.strokeStyle = "#FF3030";
  context.lineWidth = 2;
  let metrics = context.measureText(item);
  let textHeight = 18;

  context.strokeRect(
    x - metrics.width / 2 - ITEM_BOX_PADDING,
    y - textHeight - ITEM_BOX_PADDING,
    metrics.width + 2 * ITEM_BOX_PADDING,
    textHeight + 2 * ITEM_BOX_PADDING
  );

  context.fillText(item, x - metrics.width / 2, y - textHeight / 2);
}

initContext(ctx);

let trace = [];
addButton.onclick = (e) => {
  const item = parseInt(prompt("Add Item"));
  if (!isNaN(item)) {
    trace = [];
    queue.Enqueue(item, (s) => {
      trace.push([...s]);
    });
    console.log(trace);
  }
};

function loop(time) {
  for (let state of trace) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let xs = [];
    for (let i = 0; i < state.length; ++i) {
      let level = Math.floor(Math.log2(i + 1));
      if (i == 0) {
        xs.push(canvas.width / 2);
      } else {
        let countChildren = Math.pow(
          2,
          Math.floor(Math.log2(state.length)) - level
        );
        xs.push(
          xs[Math.ceil(i / 2) - 1] -
            Math.pow(-1, (i + 1) % 2) * ITEM_SPACING * countChildren
        );
      }
      drawItem(ctx, xs[i], level * 50 + 100, state[i]);
    }
  }
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
