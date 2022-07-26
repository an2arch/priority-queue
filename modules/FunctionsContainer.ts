import QueueWidget from "./QueueWidget.js";
import DrawableItem from "./DrawableItem.js";
import { getCurrentTimeStr } from "./Utility.js";

class HistoryContainer {
    private story: HTMLDivElement;
    constructor(story: HTMLDivElement) {
        this.story = story;
    }

    addToHistory(message: string): void {
        this.story.insertAdjacentHTML(
            "afterbegin",
            `<div class="info-container">
            <div class="messages">${message}</div>
            <div class="time">${getCurrentTimeStr()}</div>
        </div>`
        );
    }
}

export default class FunctionsContainer {
    private addButton: HTMLDivElement;
    private popButton: HTMLDivElement;
    private textBox: HTMLInputElement;
    private history: HistoryContainer;

    constructor(
        addButton: HTMLDivElement,
        popButton: HTMLDivElement,
        textBox: HTMLInputElement,
        storyDiv: HTMLDivElement
    ) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.textBox = textBox;
        this.history = new HistoryContainer(storyDiv);
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
    }

    handleAddItem(queue: QueueWidget): void {
        if (!this.textBox.value) {
            this.textBox.style.borderColor = "#FF3030";
            return;
        }
        this.textBox.style.borderColor = "#000";

        const item = parseFloat(this.textBox.value);
        if (!isNaN(item)) {
            if (queue.Enqueue(new DrawableItem(item))) {
                this.textBox.value = "";
                this.history.addToHistory(`add ${item}`);
            }
        }
    }

    handlePopItem(queue: QueueWidget): void {
        let result = queue.Dequeue();

        if (result === true) {
            alert("There are no items in a queue");
            return;
        }

        if (result !== false) {
            this.history.addToHistory(`pop ${result.priority}`);
        }
    }
}
