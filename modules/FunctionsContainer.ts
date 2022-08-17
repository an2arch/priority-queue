import QueueWidget from "./QueueWidget.js";
import DrawableItem from "./DrawableItem.js";
import { getCurrentTimeStr, clamp } from "./Utility.js";
import {DecQueue} from "./DecQueue";

class HistoryContainer {
    private story: HTMLDivElement;

    constructor(story: HTMLDivElement) {
        this.story = story;
    }

    delete(): void {
        if (this.story.children.length > 0) {
            this.story.children[0].remove();
        }
    }

    add(message: string): void {
        this.story.insertAdjacentHTML(
            "afterbegin",
            `<div class="info-container">
            <div class="messages">${message}</div>
            <div class="time">${getCurrentTimeStr()}</div>
        </div>`
        );
    }
}

class Slider {
    static readonly MIN_VALUE: number = 0.1;
    static readonly MAX_VALUE: number = 1.0;
    static readonly STEP: number = 0.1;
    static readonly INIT_VALUE: number = 0.5;

    private slider: HTMLInputElement;
    private indicator: HTMLInputElement;
    oninput: ((ev: Event) => any) | null = null;

    constructor(slider: HTMLInputElement, indicator: HTMLInputElement) {
        this.slider = slider;
        this.indicator = indicator;

        this.slider.min = Slider.MIN_VALUE.toString();
        this.slider.max = Slider.MAX_VALUE.toString();
        this.slider.step = Slider.STEP.toString();
        this.slider.value = Slider.INIT_VALUE.toString();

        this.indicator.min = Slider.MIN_VALUE.toString();
        this.indicator.max = Slider.MAX_VALUE.toString();
        this.indicator.step = Slider.STEP.toString();
        this.indicator.value = Slider.INIT_VALUE.toString();

        this.slider.oninput = (ev: Event) => {
            this.indicator.value = this.slider.value;
            if (this.oninput) {
                this.oninput(ev);
            }
        };

        this.slider.onwheel = (ev: WheelEvent) => {
            this.addToValue(-(ev.deltaY / 100) * Slider.STEP);

            if (this.oninput) {
                this.oninput(ev);
            }
        };

        this.indicator.oninput = (ev: Event) => {
            this.slider.value = this.indicator.value;
            if (this.oninput) {
                this.oninput(ev);
            }
        };

        this.indicator.onwheel = (ev: WheelEvent) => {
            this.addToValue(-(ev.deltaY / 100) * Slider.STEP);

            if (this.oninput) {
                this.oninput(ev);
            }
        };
    }

    private addToValue(delta: number) {
        this.slider.value = clamp(parseFloat(this.slider.value) + delta, Slider.MIN_VALUE, Slider.MAX_VALUE)
            .toFixed(1)
            .toString();

        this.indicator.value = this.slider.value;
    }

    get value(): number {
        console.assert(this.slider.value === this.indicator.value);
        return parseFloat(this.slider.value);
    }
}

export default class FunctionsContainer {
    private addButton: HTMLButtonElement;
    private popButton: HTMLButtonElement;
    private undoButton: HTMLButtonElement;
    private textBox: HTMLInputElement;
    private history: HistoryContainer;
    private slider: Slider;

    constructor(
        addButton: HTMLButtonElement,
        popButton: HTMLButtonElement,
        undoButton: HTMLButtonElement,
        textBox: HTMLInputElement,
        storyDiv: HTMLDivElement,
        sliderInput: HTMLInputElement,
        indicatorInput: HTMLInputElement,
    ) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.undoButton = undoButton;
        this.textBox = textBox;
        this.history = new HistoryContainer(storyDiv);
        this.slider = new Slider(sliderInput, indicatorInput);
    }

    link(queue: QueueWidget): void {
        this.addButton.onclick = () => {
            this.handleAddItem(queue);
        };

        this.popButton.onclick = () => {
            this.handlePopItem(queue);
        };

        this.textBox.onkeydown = (e) => {
            if (e.key === "Enter") this.handleAddItem(queue);
        };

        this.undoButton.onclick = () => {
            if (queue.undo()) {
                this.history.delete();
            }
        };

        queue.traceInterval = (Slider.MIN_VALUE * Slider.MAX_VALUE) / this.slider.value;

        this.slider.oninput = () => {
            queue.traceInterval = (Slider.MIN_VALUE * Slider.MAX_VALUE) / this.slider.value;
        };
    }

    handleAddItem(queue: QueueWidget): void {
        if (!this.textBox.value) {
            this.textBox.style.borderColor = "#FF3030";
            return;
        }
        this.textBox.style.borderColor = "#000";

        const item = parseFloat(this.textBox.value);
        if (queue.Enqueue(new DrawableItem(item))) {
            this.textBox.value = "";
            this.history.add(`add ${item}`);
        }
    }

    handlePopItem(queue: QueueWidget): void {
        let result = queue.Dequeue();

        if (result === true) {
            alert("There are no items in a queue");
            return;
        }

        if (result !== false) {
            this.history.add(`pop ${result.priority}`);
        }
    }
}
