const canvas = document.getElementById("canvas");
const canvasStyle = window.getComputedStyle(canvas);

canvas.width = document.documentElement.clientWidth * 4/5;
canvas.height = document.documentElement.clientHeight * 0.96;

const ctx = canvas.getContext("2d");

ctx.fillRect(0, 0, canvas.width, canvas.height);
