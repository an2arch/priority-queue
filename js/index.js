import FunctionsContainer from "./modules/FunctionsContainer.js";
import QueueWidget from "./modules/QueueWidget.js";
const canvas = document.getElementById("canvas");
const canvasInsideView = document.getElementById("canvasInsideView");
const story = document.getElementById("overflow");
const textBox = document.getElementById("text-box");
const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");
const undoButton = document.getElementById("undo-button");
const sliderInput = document.getElementById("slider");
const indicatorInput = document.getElementById("indicator");
const currentQueue = document.getElementById("current-queue");
let queueWidget = new QueueWidget(canvas, canvasInsideView);
let funcContainer = new FunctionsContainer(addButton, popButton, undoButton, textBox, story, sliderInput, indicatorInput);
funcContainer.link(queueWidget);
let prevTime = null;
function loop(time) {
    if (prevTime) {
        let deltaTime = (time - prevTime) * 0.001;
        queueWidget.update(deltaTime);
        queueWidget.render();
    }
    prevTime = time;
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
