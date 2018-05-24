"use strict";

function makeBigCard(editable = false) {

}

function makeCards(cards) {
    // only show at most 60 cards.
    if (cards.length === 0) {
        cards = [{
            to: "nobody",
            from: "nowhere",
            say: "不好意思，看起来还没有人表白过呢？\n爱就大声说出来吧！"
        }];
    } else {
        cards = cards.map((c) => {
            try {
                return JSON.parse(c);
            }
            catch (e) {
                return 0;
            }
        }).filter((c) => typeof (c) === "object" && "to" in c && "from" in c && "say" in c)
    }
    var num = Math.min(cards.length, 60);
    var pages = Math.ceil(num / 6);

    var cardgroup = document.getElementById("cardgroup");
    var dots = document.getElementById("dots");

    document.getElementById("bigcard").classList.add("vanish");
    cardgroup.classList.remove("vanish");

    for (var i = 0; i < pages; i++) {
        var dot = document.createElement("div");
        dots.appendChild(dot);
        var clickFunc = function (i, dot) {
            return function () {
                Array.prototype.forEach.call(dots.children, function (d) {
                    d.classList.remove("active");
                })
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
                    cardgroup.appendChild(card);
                }
            }
        }
        dot.onclick = clickFunc(i, dot);
    }
    dots.children[0].click();
}

getLines(function (resp) {
    if (!resp.execute_err) {
        makeCards(JSON.parse(resp.result));
    } else {
        console.error(resp.execute_err);
    }
});

