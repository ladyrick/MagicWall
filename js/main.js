"use strict";

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
                    if (msg.is_thumb_up) {
                        var color = "red";
                        thumbimg.onclick = (function (msg) {
                            return thumbDown.bind(null, msg.id, function () {
                                makeBigCard("show", msg);
                            });
                        })(msg);
                    } else {
                        var color = "gray";
                        thumbimg.onclick = (function (msg) {
                            return thumbUp.bind(null, msg.id, function () {
                                makeBigCard("show", msg);
                            });
                        })(msg);
                    }
                    thumbimg.setAttribute("src", "img/thumb_up_" + color + ".svg");
                    var thumbnum = document.createElement("div");
                    thumbnum.textContent = msg.thumb_count || 0;
                    var commentimg = document.createElement("img");
                    commentimg.setAttribute("src", "img/comment.svg");
                    commentimg.onclick = (function (msg) {
                        return function () {
                            document.getElementById("spinner").classList.remove("vanish");
                            document.getElementById("bigcard").classList = "vanish";
                            document.getElementById("cardgroup").classList = "vanish";
                            getComments(msg.id, function (resp) {
                                if (resp.success) {
                                    var comments = JSON.parse(resp.result);
                                    if (comments.length === 0) {
                                        comments = [{ comment: "糟糕，还没有人评论过呢。", from: "系统提示" }];
                                    }
                                } else {
                                    var comments = [{ comment: "获取评论时发生了错误……", from: "系统提示" }];
                                }
                                showComments(msg, comments);
                            });
                        }
                    })(msg);
                    var commentnum = document.createElement("div");
                    commentnum.textContent = msg.comment_count || 0;
                    comment.appendChild(thumbimg);
                    comment.appendChild(thumbnum);
                    comment.appendChild(commentimg);
                    comment.appendChild(commentnum);
                    say.appendChild(textarea);
                    card.appendChild(to);
                    card.appendChild(say);
                    card.appendChild(from);
                    card.appendChild(comment);
                    for (var d of [to, say, from])
                        d.onclick = (function (msg) {
                            return makeBigCard.bind(null, "show", msg);
                        })(msg);
                    cardgroup.appendChild(card);
                    if (textarea.scrollHeight > say.clientHeight - 10) {
                        textarea.classList.add("scroll");
                    }
                }
            }
        })(i, dot);
    }
    dots.children[0].click();

    // set left button.
    var leftbtn = document.getElementById("leftbtn")
    leftbtn.textContent = "使用说明";
    window.localStorage.leftbtn = "使用说明";
    leftbtn.onclick = makeBigCard.bind(null, "intro", {
        to: "尊敬的用户",
        from: "管理员先生",
        say: "欢迎大家。\n" +
            "这里，你可以将你的想法，广播到全世界，让全世界听到你的声音。\n" +
            "只需要花费极少量的金钱，就可以将你的言语永久保存到云端。\n" +
            "注意，请文明发言，不要花费金钱制造垃圾信息，谢谢。"
    });

    // set right button.
    var rightbtn = document.getElementById("rightbtn");
    rightbtn.textContent = "我要广播";
    rightbtn.onclick = makeBigCard.bind(null, "new");
}

function makeBigCard(mode, data) {
    if (mode === "show") {
        window.localStorage.page = "bigcard";
        window.localStorage.id = data.id;
    } else {
        window.localStorage.page = "index";
    }
    document.getElementById("cardgroup").classList.add("vanish");
    document.getElementById("dots").classList.add("vanish");
    var bigcard = document.getElementById("bigcard");
    bigcard.classList = "";
    bigcard.innerHTML = "";

    if (mode === "new") {
        bigcard.classList.add("new");
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
        if (data.is_thumb_up) {
            var color = "red";
            thumbimg.onclick = thumbDown.bind(null, data.id, function () {
                makeBigCard("show", data);
            });
        } else {
            var color = "gray";
            thumbimg.onclick = thumbUp.bind(null, data.id, function () {
                makeBigCard("show", data);
            });
        }
        thumbimg.setAttribute("src", "img/thumb_up_" + color + ".svg");
        var thumbnum = document.createElement("div");
        thumbnum.textContent = data.thumb_count;
        var commentimg = document.createElement("img");
        commentimg.setAttribute("src", "img/comment.svg");
        commentimg.onclick = (function (msg) {
            return function () {
                document.getElementById("spinner").classList.remove("vanish");
                document.getElementById("bigcard").classList = "vanish";
                document.getElementById("cardgroup").classList = "vanish";
                getComments(msg.id, function (resp) {
                    if (resp.success) {
                        var comments = JSON.parse(resp.result);
                        if (comments.length === 0) {
                            comments = [{ comment: "糟糕，还没有人评论过呢。", from: "系统提示" }];
                        }
                    } else {
                        var comments = [{ comment: "获取评论时发生了错误……", from: "系统提示" }];
                    }
                    showComments(msg, comments);
                });
            }
        })(data);
        var commentnum = document.createElement("div");
        commentnum.textContent = data.comment_count;
        comment.appendChild(thumbimg);
        comment.appendChild(thumbnum);
        comment.appendChild(commentimg);
        comment.appendChild(commentnum);
        from.appendChild(comment);
    }

    bigcard.appendChild(to);
    bigcard.appendChild(say);
    bigcard.appendChild(from);

    if (textarea.scrollHeight > say.clientHeight - 10) {
        textarea.classList.add("scroll");
    }

    // set left button.
    var leftbtn = document.getElementById("leftbtn");
    leftbtn.textContent = "返回";
    window.localStorage.leftbtn = "返回";
    leftbtn.onclick = function () {
        window.localStorage.page = "index";
        init();
    };
    // set right button.
    var rightbtn = document.getElementById("rightbtn");
    if (mode === "new") {
        var rightbtn = document.getElementById("rightbtn");
        rightbtn.textContent = "广播";
        rightbtn.onclick = function () {
            if (document.querySelector("#bigcard .say textarea").value === "") {
                var warns = ["真的不打算说些什么吗？", "说些什么吧。", "不说些什么的话，无法保存哦。", "有必填项没填呢。"];
                myalert(warns[Math.floor(Math.random() * warns.length)], 1000);
                return;
            }
            saveLine({
                to: towhom.value,
                from: fromwhom.value,
                say: textarea.value
            }, function () {
                makeCards(window.cards);
            });
        };
    } else {
        rightbtn.textContent = "我要广播";
        rightbtn.onclick = makeBigCard.bind(null, "new");
    }
}

function showComments(data, comments) {
    localStorage.page = "bigcard";
    var id = data.id;
    localStorage.id = data.id;

    var bigcard = document.getElementById("bigcard");
    bigcard.innerHTML = "";
    bigcard.classList = "comments";
    document.getElementById("cardgroup").innerHTML = "";

    // header
    var content = document.createElement("div");
    content.classList.add("content");
    var textContent = document.createElement("div");
    textContent.textContent = data.say || "";
    textContent.title = data.say || "";
    var labelContent = document.createElement("div");
    labelContent.textContent = "的评论";
    content.appendChild(textContent);
    content.appendChild(labelContent);

    // comment list
    var commentList = document.createElement("div");
    commentList.classList = "commentlist";
    for (var c of comments) {
        var oneComment = document.createElement("div");
        var from = document.createElement("strong");
        if (c.from.length > 15) {
            var fromtext = c.from.substring(0, 15) + "…";
            from.title = fromtext;
        } else if (c.from.length === 0) {
            var fromtext = "匿名用户";
        } else {
            var fromtext = c.from;
        }
        from.textContent = fromtext + ": ";
        oneComment.appendChild(from);
        oneComment.appendChild(document.createTextNode(c.comment));
        commentList.appendChild(oneComment);
    }

    // add comment
    var addCommentDOM = document.createElement("div");
    addCommentDOM.classList = "addcomment";
    var textarea = document.createElement("textarea");
    textarea.setAttribute("placeholder", "添加评论~");
    var submit = document.createElement("div");
    submit.textContent = "提交";
    addCommentDOM.appendChild(textarea);
    addCommentDOM.appendChild(submit);
    submit.onclick = (function (id, textarea) {
        return function () {
            var comment = textarea.value;
            if (comment === "") {
                myalert("还没写评论内容呢。", 1000);
                return;
            }
            var from = prompt("请问怎么称呼您？不填则为匿名用户。");
            addComment(id, { comment: comment, from: from }, function () {
                textarea.value = "";
            });
        }
    })(data.id, textarea);

    bigcard.appendChild(content);
    bigcard.appendChild(commentList);
    bigcard.appendChild(addCommentDOM);

    var leftbtn = document.getElementById("leftbtn");
    leftbtn.textContent = "返回";
    window.localStorage.leftbtn = "返回";
    leftbtn.onclick = function () {
        window.localStorage.page = "index";
        init();
    };
    // set right button.
    var rightbtn = document.getElementById("rightbtn");
    rightbtn.textContent = "我要广播";
    rightbtn.onclick = makeBigCard.bind(null, "new");
}

function init() {
    getWalletAddress();
    document.getElementById("bigcard").innerHTML = "";
    document.getElementById("cardgroup").innerHTML = "";
    document.getElementById("bigcard").classList.add("vanish");
    document.getElementById("spinner").classList.remove("vanish");
    var page = window.localStorage.page;
    if (!page || page === "index") {
        window.localStorage.page = "index";
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
    } else {
        getByID(parseInt(window.localStorage.id), function (resp) {
            document.getElementById("spinner").classList.add("vanish");
            if (resp.success) {
                var bigcard = JSON.parse(resp.result);
                makeBigCard("show", bigcard);
            } else {
                makeBigCard("intro", {
                    id: -1,
                    say: "看起来发生了一些错误呢。试着检查一下网络连接？"
                });
            }
        });
    }
}

window.onload = init;
