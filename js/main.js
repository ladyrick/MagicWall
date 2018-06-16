"use strict";

function makeBigCard(mode, data) {
    document.getElementById("cardgroup").classList.add("vanish");
    document.getElementById("dots").classList.add("vanish");
    var bigcard = document.getElementById("bigcard");
    bigcard.classList = "";
    bigcard.innerHTML = "";
    var leftbtn = document.getElementById("leftbtn");
    leftbtn.textContent = "返回";
    leftbtn.onclick = makeCards.bind(null, window.cards);

    if (mode === "new") {
        bigcard.classList.add("new");
        var rightbtn = document.getElementById("rightbtn");
        rightbtn.textContent = "广播";
        rightbtn.onclick = function () {
            if (document.querySelector("#bigcard .say textarea").value === "") {
                var warns = ["真的不打算说些什么吗？", "说些什么吧。", "不说些什么的话，无法保存哦。", "有必填项没填呢。"];
                alert(warns[Math.floor(Math.random() * warns.length)]);
                return;
            }
            saveLine({
                to: towhom.value,
                from: fromwhom.value,
                say: textarea.value
            }, function () {
                alert("将数据保存到链上需要一定时间，大约是30秒左右，因此无法立即显示。\n请过会儿刷新页面查看吧。")
                makeCards(window.cards);
            });
        };
    } else if (mode === "intro") {
        bigcard.classList.add("intro");
    } else {
        bigcard.classList.add("show");
    }


    var to = document.createElement("div");
    to.classList.add("to");
    if (mode !== "new") {
        to.title = data.to || "";
    }
    var tolabel = document.createElement("div");
    tolabel.classList.add("label");
    if (mode !== "new" && !data.to) {
        tolabel.textContent = "";
    } else {
        tolabel.textContent = "To: ";
    }
    var towhom = document.createElement(mode === "new" ? "input" : "div");
    towhom.classList.add("towhom");
    towhom.setAttribute("placeholder", mode === "new" ? "您打算向谁倾诉？(非必填)" : "");
    towhom[mode === "new" ? "value" : "textContent"] = mode === "new" ? "" : data.to;
    to.appendChild(tolabel);
    to.appendChild(towhom);


    var say = document.createElement("div");
    say.classList.add("say");
    var textarea = document.createElement("textarea");

    if (mode !== "new") {
        textarea.disabled = "disabled";
        textarea.textContent = data.say;
    } else {
        textarea.setAttribute("placeholder", "说些什么吧。(必填)");
    }
    say.appendChild(textarea);


    var from = document.createElement("div");
    from.classList.add("from");
    if (mode !== "new") {
        from.title = data.from || "";
    }
    var fromlabel = document.createElement("div");
    fromlabel.classList.add("label");
    if (mode !== "new" && !data.from) {
        fromlabel.textContent = "";
    } else {
        fromlabel.textContent = "From: ";
    }
    var fromwhom = document.createElement(mode === "new" ? "input" : "div");
    fromwhom.classList.add("fromwhom");
    fromwhom.setAttribute("placeholder", mode === "new" ? "请问怎么称呼您？(非必填)" : "");
    fromwhom[mode === "new" ? "value" : "textContent"] = mode === "new" ? "" : data.from;
    from.appendChild(fromwhom);
    from.appendChild(fromlabel);
    if (mode === "show") {
        var comment = document.createElement("div");
        comment.classList.add("comment");
        var thumbimg = document.createElement("img");
        thumbimg.setAttribute("src", "img/thumb_up_red.svg");
        var thumbnum = document.createElement("div");
        thumbnum.textContent = data.thumbs ? data.thumbs.length : 0;
        var commentimg = document.createElement("img");
        commentimg.setAttribute("src", "img/comment.svg");
        var commentnum = document.createElement("div");
        commentnum.textContent = data.commentIDs ? data.commentIDs.length : 0;
        comment.appendChild(thumbimg);
        comment.appendChild(thumbnum);
        comment.appendChild(commentimg);
        comment.appendChild(commentnum);
        from.appendChild(comment);
    }

    bigcard.appendChild(to);
    bigcard.appendChild(say);
    bigcard.appendChild(from);
}

function makeCards(cards) {
    // only show at most 60 cards.
    if (cards.length === 0) {
        cards = [{ say: "还没有人广播过呢~" }];
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
                    to.title = msg.to || "";
                    to.textContent = msg.to ? "To: " + msg.to : "";
                    var say = document.createElement("div");
                    say.classList.add("say");
                    var textarea = document.createElement("textarea");
                    textarea.disabled = "disabled";
                    textarea.textContent = msg.say || "";
                    var from = document.createElement("div");
                    from.classList.add("from");
                    from.title = msg.from || "";
                    from.textContent = msg.from ? "From: " + msg.from : "";
                    var comment = document.createElement("div");
                    comment.classList.add("comment");
                    var thumbimg = document.createElement("img");
                    thumbimg.setAttribute("src", "img/thumb_up_gray.svg");
                    var thumbnum = document.createElement("div");
                    thumbnum.textContent = msg.thumbs ? msg.thumbs.length : 0;
                    var commentimg = document.createElement("img");
                    commentimg.setAttribute("src", "img/comment.svg");
                    var commentnum = document.createElement("div");
                    commentnum.textContent = msg.commentIDs ? msg.commentIDs.length : 0;
                    comment.appendChild(thumbimg);
                    comment.appendChild(thumbnum);
                    comment.appendChild(commentimg);
                    comment.appendChild(commentnum);
                    say.appendChild(textarea);
                    card.appendChild(to);
                    card.appendChild(say);
                    card.appendChild(from);
                    card.appendChild(comment);
                    card.onclick = (function (msg) {
                        return makeBigCard.bind(null, "show", msg);
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
    leftbtn.onclick = makeBigCard.bind(null, "intro", {
        to: "尊敬的用户",
        from: "管理员先生",
        say: "欢迎大家。\n" +
            "这里，您可以将您想说的话，广播到全世界，让全世界听到您的声音。\n" +
            "只需要花费极少量的金钱，就可以将您的言语永久保存到云端。\n" +
            "注意，请文明发言，不要花费金钱制造垃圾信息，谢谢。"
    });

    // set right button.
    var rightbtn = document.getElementById("rightbtn");
    rightbtn.textContent = "我要广播";
    rightbtn.onclick = makeBigCard.bind(null, "new");
}

function init() {
    getWalletAddress();
    getLines(function (resp) {
        document.getElementById("spinner").classList.add("vanish");
        if (resp.success) {
            window.cards = JSON.parse(resp.result);
            window.cards.sort(() => Math.random() - 0.5);
            makeCards(window.cards);
        } else {
            console.error(resp.execute_err);
            window.cards = [{ to: "", from: "", say: "看起来发生了一些错误呢。试着检查一下网络连接？" }];
            makeCards(window.cards);
        }
    });
}

window.onload = init;
