import FunctionsContainer from "./modules/FunctionsContainer.js";
import QueueWidget from "./modules/QueueWidget.js";
const canvas = document.getElementById("canvas");
const story = document.getElementById("overflow");
const textBox = document.getElementById("text-box");
const addButton = document.getElementById("add-button");
const popButton = document.getElementById("pop-button");
let queueWidget = new QueueWidget(canvas);
let funcContainer = new FunctionsContainer(addButton, popButton, textBox, story);
funcContainer.link(queueWidget);
function loop(time) {
    queueWidget.update();
    queueWidget.render();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
