import DecQueue from "./DecQueue.js";
import FunctionsContainer from "./FunctionsContainer.js";
import QueueWidget from "./QueueWidget.js";
const canvas = document.getElementById("canvas");
const story = document.getElementById("overflow");
const textBox = document.getElementById("text-box");
const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");
const queue = new DecQueue();
let queueWidget = new QueueWidget(canvas);
let funcContainer = new FunctionsContainer(addButton, popButton, textBox, story, queue);
function loop(time) {
    queueWidget.update(queue);
    queueWidget.render();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
