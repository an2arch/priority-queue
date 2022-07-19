import DecQueue from "./DecQueue.js";
import FunctionsContainer from "./FunctionsContainer.js";
import QueueWidget from "./QueueWidget.js";

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const story: HTMLDivElement = document.getElementById("overflow") as HTMLDivElement;
const textBox = document.getElementById("text-box") as HTMLInputElement;
const addButton = document.getElementById("add-button") as HTMLDivElement;
const popButton = document.getElementById("pop-button") as HTMLDivElement;

const queue: DecQueue = new DecQueue();
let queueWidget = new QueueWidget(canvas);
let funcContainer = new FunctionsContainer(addButton, popButton, textBox, story, queue);

function loop(time: DOMHighResTimeStamp) {
    queueWidget.update(queue);
    queueWidget.render();
    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
