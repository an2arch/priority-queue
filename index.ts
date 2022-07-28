import FunctionsContainer from "./modules/FunctionsContainer.js";
import QueueWidget from "./modules/QueueWidget.js";

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;

const story: HTMLDivElement = document.getElementById("overflow") as HTMLDivElement;

const textBox = document.getElementById("text-box") as HTMLInputElement;

const addButton = document.getElementById("add-button") as HTMLButtonElement;
const popButton = document.getElementById("pop-button") as HTMLButtonElement;
const undoButton = document.getElementById("undo-button") as HTMLButtonElement;

const sliderInput = document.getElementById("slider") as HTMLInputElement;
const indicatorInput = document.getElementById("indicator") as HTMLInputElement;

let queueWidget = new QueueWidget(canvas);
let funcContainer = new FunctionsContainer(
    addButton,
    popButton,
    undoButton,
    textBox,
    story,
    sliderInput,
    indicatorInput
);

funcContainer.link(queueWidget);
let prevTime: DOMHighResTimeStamp | null = null;
function loop(time: DOMHighResTimeStamp) {
    if (prevTime) {
        let deltaTime = (time - prevTime) * 0.001;
        queueWidget.update(deltaTime);
        queueWidget.render();
    }
    prevTime = time;
    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
