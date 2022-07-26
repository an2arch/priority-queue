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
