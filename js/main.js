"use strict";

function makeBigCard(edit, data) {
    document.getElementById("cardgroup").classList.add("vanish");
    document.getElementById("dots").classList.add("vanish");
    var bigcard = document.getElementById("bigcard");
    bigcard.classList.remove("vanish");
    bigcard.innerHTML = "";
    var leftbtn = document.getElementById("leftbtn");
    leftbtn.textContent = "返回";
    leftbtn.onclick = makeCards.bind(null, window.cards);

    if (edit) {
        var rightbtn = document.getElementById("rightbtn");
        rightbtn.textContent = "送我上墙";
        rightbtn.onclick = function () {
            saveLine({
                to: towhom.value,
                from: fromwhom.value,
                say: textarea.value
            }, function () {
                makeCards(window.cards);
            });
        };
    }


    var to = document.createElement("div");
    to.classList.add("to");
    if (!edit) { to.title = data.to; }
    var tolabel = document.createElement("div");
    tolabel.classList.add("label");
    tolabel.textContent = "To: ";
    var towhom = document.createElement(edit ? "input" : "div");
    towhom.classList.add("towhom");
    towhom[edit ? "value" : "textContent"] = edit ? "" : data.to;
    to.appendChild(tolabel);
    to.appendChild(towhom);


    var say = document.createElement("div");
    say.classList.add("say");
    var textarea = document.createElement("textarea");
    if (!edit) {
        textarea.disabled = "disabled";
        textarea.textContent = data.say;
    }
    say.appendChild(textarea);


    var from = document.createElement("div");
    from.classList.add("from");
    if (!edit) { from.title = data.from; }
    var fromlabel = document.createElement("div");
    fromlabel.classList.add("label");
    fromlabel.textContent = "From: ";
    var fromwhom = document.createElement(edit ? "input" : "div");
    fromwhom.classList.add("fromwhom");
    fromwhom[edit ? "value" : "textContent"] = edit ? "" : data.from;
    from.appendChild(fromwhom);
    from.appendChild(fromlabel);


    bigcard.appendChild(to);
    bigcard.appendChild(say);
    bigcard.appendChild(from);
}

function makeCards(cards) {
    // only show at most 60 cards.
    if (cards.length === 0) {
        cards = [{
            to: "nobody",
            from: "nowhere",
            say: "不好意思，看起来还没有人表白过呢？\n爱就大声说出来吧！"
        }];
    }
    var num = Math.min(cards.length, 60);
    var pages = Math.ceil(num / 6);

    var cardgroup = document.getElementById("cardgroup");
    var dots = document.getElementById("dots");
    dots.classList.remove("vanish");
    dots.innerHTML = "";

    document.getElementById("bigcard").classList.add("vanish");
    cardgroup.classList.remove("vanish");

    for (var i = 0; i < pages; i++) {
        var dot = document.createElement("div");
        dots.appendChild(dot);
        dot.onclick = (function (i, dot) {
            return function () {
                Array.prototype.forEach.call(dots.children, function (d) {
                    d.classList.remove("active");
                });
                dot.classList.add("active");
                cardgroup.innerHTML = "";
                for (var j = i * 6; j < i * 6 + 6 && j < num; j++) {
                    var msg = cards[j];
                    var card = document.createElement("div");
                    card.classList.add("card");
                    var to = document.createElement("div");
                    to.classList.add("to");
                    to.title = msg.to;
                    to.textContent = msg.to;
                    var say = document.createElement("div");
                    say.classList.add("say");
                    var textarea = document.createElement("textarea");
                    textarea.disabled = "disabled";
                    textarea.textContent = msg.say;
                    var from = document.createElement("div");
                    from.classList.add("from");
                    from.title = msg.from;
                    from.textContent = msg.from;
                    say.appendChild(textarea);
                    card.appendChild(to);
                    card.appendChild(say);
                    card.appendChild(from);
                    card.onclick = (function (msg) {
                        return makeBigCard.bind(null, false, msg);
                    })(msg);
                    cardgroup.appendChild(card);
                }
            }
        })(i, dot);
    }
    dots.children[0].click();

    // set left button.
    var leftbtn = document.getElementById("leftbtn")
    leftbtn.textContent = "使用说明";
    leftbtn.onclick = makeBigCard.bind(null, false, {
        to: "亲爱的用户",
        from: "管理员先生",
        say: "欢迎大家使用\"星云表白墙\"。\n" +
            "你有没有遇到过这些情景。比如，当你想对父母表达对他们的爱和感恩，却迟迟无法启齿；再或者，当你和你的爱人想要镌刻永恒的见证，告诉全世界你们有多么相爱；又或者，当你暗恋一个人，却无法走进TA的生活，想悄悄告诉TA……\n" +
            "此时，你需要的就是\"星云表白墙\"！在这里，你只要花费少量的金钱，就可以在表白墙上留下自己的印记，它是永恒的且永远不可更改。\n" +
            "现在点击“我要表白”，开始向你爱的人吐露心声吧！\n" +
            "注意，请文明发言，不要花费金钱制造垃圾信息，谢谢。\n" + "如果您想打赏，让我今晚可以吃顿好的，我将感激不尽！打赏请在发起交易时直接修改金额即可。"
    });

    // set right button.
    var rightbtn = document.getElementById("rightbtn");
    rightbtn.textContent = "我要表白";
    rightbtn.onclick = makeBigCard.bind(null, true);
}

function init() {
    getLines(function (resp) {
        if (!resp.execute_err) {
            window.cards = JSON.parse(resp.result);
            window.cards = window.cards.map((c, i) => ({
                to: c.to || "一个幸福的人",
                from: c.from || "一个有爱的人",
                say: c.say || "一些没有勇气说出的话。"
            }));
            makeCards(window.cards);
        } else {
            console.error(resp.execute_err);
        }
    });
}

window.onload = init;
