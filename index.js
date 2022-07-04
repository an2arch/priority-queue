import DecQueue from "./DecQueue.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const queue = new DecQueue();

canvas.width = (document.documentElement.clientWidth * 4) / 5;
canvas.height = document.documentElement.clientHeight - 20;

ctx.clearRect(0, 0, ctx.width, ctx.height);
