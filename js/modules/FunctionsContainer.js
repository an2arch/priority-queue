import DrawableItem from "./DrawableItem.js";
import { getCurrentTimeStr } from "./Utility.js";
class HistoryContainer {
    constructor(story) {
        this.story = story;
    }
    addToHistory(message) {
        this.story.insertAdjacentHTML("afterbegin", `<div class="info-container">
            <div class="messages">${message}</div>
            <div class="time">${getCurrentTimeStr()}</div>
        </div>`);
    }
}
export default class FunctionsContainer {
    constructor(addButton, popButton, textBox, storyDiv) {
        this.addButton = addButton;
        this.popButton = popButton;
        this.textBox = textBox;
        this.history = new HistoryContainer(storyDiv);
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
    }
    handleAddItem(queue) {
        if (!this.textBox.value) {
            this.textBox.style.borderColor = "#FF3030";
            return;
        }
        this.textBox.style.borderColor = "#000";
        const item = parseFloat(this.textBox.value);
        if (!isNaN(item)) {
            this.textBox.value = "";
            let trace = [];
            queue.Enqueue(new DrawableItem(item), (s) => {
                trace.push([...s]);
            });
            console.log(trace);
            this.history.addToHistory(`add ${item}`);
        }
    }
    handlePopItem(queue) {
        let trace = [];
        let result = queue.Dequeue((s) => {
            trace.push([...s]);
        });
        console.log(trace);
        if (result === null) {
            alert("There are no items in a queue");
            return;
        }
        this.history.addToHistory(`pop ${result}`);
    }
}
