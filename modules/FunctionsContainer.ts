import DecQueue from "./DecQueue.js";
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
        storyDiv: HTMLDivElement,
        queue: DecQueue
    ) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.textBox = textBox;
        this.history = new HistoryContainer(storyDiv);

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

    handleAddItem(decQueue: DecQueue): void {
        if (!this.textBox.value) {
            this.textBox.style.borderColor = "#FF3030";
            return;
        }
        this.textBox.style.borderColor = "#000";

        const item = parseFloat(this.textBox.value);
        if (!isNaN(item)) {
            this.textBox.value = "";
            let trace = [];
            decQueue.Enqueue(item, (s) => {
                trace.push([...s]);
            });
            this.history.addToHistory(`add ${item}`);
        }
    }

    handlePopItem(decQueue: DecQueue): void {
        let trace = [];
        let result = decQueue.Dequeue((s) => {
            trace.push([...s]);
        });

        if (result === null) {
            alert("There are no items in a queue");
            return;
        }
        this.history.addToHistory(`pop ${result}`);
    }
}

