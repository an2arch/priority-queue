import DrawableItem from "./DrawableItem.js";
import { getCurrentTimeStr, clamp } from "./Utility.js";
class HistoryContainer {
    constructor(story) {
        this.story = story;
    }
    delete() {
        if (this.story.children.length > 0) {
            this.story.children[0].remove();
        }
    }
    add(message) {
        this.story.insertAdjacentHTML("afterbegin", `<div class="info-container">
            <div class="messages">${message}</div>
            <div class="time">${getCurrentTimeStr()}</div>
        </div>`);
    }
}
class Slider {
    constructor(slider, indicator) {
        this.oninput = null;
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
        this.slider.oninput = (ev) => {
            this.indicator.value = this.slider.value;
            if (this.oninput) {
                this.oninput(ev);
            }
        };
        this.slider.onwheel = (ev) => {
            this.addToValue(-(ev.deltaY / 100) * Slider.STEP);
            if (this.oninput) {
                this.oninput(ev);
            }
        };
        this.indicator.oninput = (ev) => {
            this.slider.value = this.indicator.value;
            if (this.oninput) {
                this.oninput(ev);
            }
        };
        this.indicator.onwheel = (ev) => {
            this.addToValue(-(ev.deltaY / 100) * Slider.STEP);
            if (this.oninput) {
                this.oninput(ev);
            }
        };
    }
    addToValue(delta) {
        this.slider.value = clamp(parseFloat(this.slider.value) + delta, Slider.MIN_VALUE, Slider.MAX_VALUE)
            .toFixed(1)
            .toString();
        this.indicator.value = this.slider.value;
    }
    get value() {
        console.assert(this.slider.value === this.indicator.value);
        return parseFloat(this.slider.value);
    }
}
Slider.MIN_VALUE = 0.1;
Slider.MAX_VALUE = 2.0;
Slider.STEP = 0.1;
Slider.INIT_VALUE = 1.0;
export default class FunctionsContainer {
    constructor(addButton, popButton, undoButton, textBox, storyDiv, sliderInput, indicatorInput) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.undoButton = undoButton;
        this.textBox = textBox;
        this.history = new HistoryContainer(storyDiv);
        this.slider = new Slider(sliderInput, indicatorInput);
    }
    link(queue) {
        this.addButton.onclick = () => {
            this.handleAddItem(queue);
        };
        this.popButton.onclick = () => {
            this.handlePopItem(queue);
        };
        this.textBox.onkeydown = (e) => {
            if (e.key === "Enter")
                this.handleAddItem(queue);
        };
        this.undoButton.onclick = () => {
            if (queue.undo()) {
                this.history.delete();
            }
        };
        this.slider.oninput = () => {
            queue.traceInterval = (Slider.MIN_VALUE * Slider.MAX_VALUE) / this.slider.value;
        };
    }
    handleAddItem(queue) {
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
    handlePopItem(queue) {
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
