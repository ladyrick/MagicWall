"use strict";

(function () {
    var canvasPage3 = document.getElementById("background");
    var width = window.innerWidth;
    var height = window.innerHeight;
    canvasPage3.width = width;
    canvasPage3.height = height;
    var ctx = canvasPage3.getContext("2d");
    var zhongX = width / 2;
    var zhongY = height / 2;
    var tickDuration = 10;
    var density = 0.0001;
    var distance = 120;
    function randomNum(x, y) {
        return Math.floor(Math.random() * (y - x + 1) + x);
    }

    function randomColor() {
        return "rgb(" + randomNum(0, 255) + "," + randomNum(0, 255) + "," + randomNum(0, 255) + ")";
    }

    function Ball() {
        this.r = randomNum(0.1, 3);
        this.color = 'white';

        //随机选取小球位置
        this.x = randomNum(this.r, canvasPage3.width - this.r);
        this.y = randomNum(this.r, canvasPage3.height - this.r);

        //小球的速度范围，以及正负。
        this.speedX = randomNum(10, 20) * (randomNum(0, 1) ? 1 : -1);
        this.speedY = randomNum(10, 20) * (randomNum(0, 1) ? 1 : -1);
    }

    Ball.prototype.move = function () {
        this.x += this.speedX * tickDuration / 1000;
        this.y += this.speedY * tickDuration / 1000;

        //小球触及左右边界处理
        if (this.x <= this.r) {
            this.x = this.r;
            this.speedX *= -1;
        }
        if (this.x >= canvasPage3.width - this.r) {
            this.x = canvasPage3.width - this.r;
            this.speedX *= -1;
        }

        //小球触及上下边界处理
        if (this.y <= this.r) {
            this.y = this.r;
            //反弹
            this.speedY *= -1;
        }
        if (this.y >= canvasPage3.height - this.r) {
            this.y = canvasPage3.height - this.r;
            //反弹
            this.speedY *= -1;
        }
    }

    Ball.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    var balls = [];
    for (var i = 0; i < density * canvasPage3.width * canvasPage3.height; i++) {
        balls.push(new Ball());
    }

    function tick() {
        var arr = [];
        ctx.clearRect(0, 0, canvasPage3.width, canvasPage3.height);
        for (var i = 0; i < balls.length; i++) {
            balls[i].move();
            balls[i].draw();
            if (ballAndMouse(balls[i]) < distance) {
                ctx.lineWidth = (130 - ballAndMouse(balls[i])) * 1.5 / 130;
                ctx.beginPath();
                ctx.moveTo(balls[i].x, balls[i].y);
                ctx.lineTo(zhongX, zhongY);
                ctx.strokeStyle = balls[i].color;
                ctx.stroke();
            }
        }

        for (var i = 0; i < balls.length; i++) {
            for (var j = 0; j < balls.length; j++) {
                if (ballAndBall(balls[i], balls[j]) < distance) {
                    ctx.lineWidth = (80 - ballAndBall(balls[i], balls[j])) * 0.6 / 80;
                    ctx.globalAlpha = (130 - ballAndBall(balls[i], balls[j])) * 1 / 80;
                    ctx.beginPath();
                    ctx.moveTo(balls[i].x, balls[i].y);
                    ctx.lineTo(balls[j].x, balls[j].y);
                    ctx.strokeStyle = balls[i].color;
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1.0;
    }

    setInterval(tick, tickDuration);

    canvasPage3.onmousemove = function (event) {
        event = event || window.event;
        zhongX = event.offsetX;
        zhongY = event.offsetY;
    }

    function ballAndMouse(obj) {
        var disX = Math.abs(zhongX - obj.x);
        var disY = Math.abs(zhongY - obj.y);
        return Math.sqrt(disX * disX + disY * disY);
    }
    function ballAndBall(obj1, obj2) {
        var disX = Math.abs(obj1.x - obj2.x);
        var disY = Math.abs(obj1.y - obj2.y);
        return Math.sqrt(disX * disX + disY * disY);
    }
})();