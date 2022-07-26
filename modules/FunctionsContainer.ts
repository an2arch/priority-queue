import QueueWidget from "./QueueWidget.js";
import DrawableItem from "./DrawableItem.js";
import { getCurrentTimeStr } from "./Utility.js";

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

export default class FunctionsContainer {
    private addButton: HTMLButtonElement;
    private popButton: HTMLButtonElement;
    private undoButton: HTMLButtonElement;
    private textBox: HTMLInputElement;
    private history: HistoryContainer;

    constructor(
        addButton: HTMLButtonElement,
        popButton: HTMLButtonElement,
        undoButton: HTMLButtonElement,
        textBox: HTMLInputElement,
        storyDiv: HTMLDivElement
    ) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.undoButton = undoButton;
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

        this.undoButton.onclick = () => {
            if (queue.undo()) {
                this.history.delete();
            }
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
                this.history.add(`add ${item}`);
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
            this.history.add(`pop ${result.priority}`);
        }
    }
}
