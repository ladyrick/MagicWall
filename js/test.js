function testGet() {
    function testOneGet(args) {
        var callargs = (args === undefined ? "" : [args]);
        nebPayCall({
            func: "get",
            args: callargs,
            listener: function (resp) {
                console.log("callargs:", callargs);
                console.log(resp);
            }
        }, true);
    }
    testOneGet();
    testOneGet(2);
    testOneGet(0);
    testOneGet(-1);
    testOneGet(100);
    testOneGet([1, 2, 3]);
}

function testGetByID(id) {
    nebPayCall({
        func: "getByID",
        args: [id],
        listener: function (resp) {
            console.log(resp);
        }
    }, true);
}

function testSaveLine1() {
    saveLine({ to: 1, from: 2, say: 3 });
}
function testSaveLine2() {
    saveLine({ to: 1, from: 2 });
}

function testWithdrawNASToAdmin() {
    nebPayCall({
        func: "withdrawNASToAdmin"
    });
}

function testGetVault() {
    nebPayCall({
        func: "getVault",
        listener: function (resp) {
            if (!resp.execute_err) {
                log("vault: " + JSON.parse(resp.result));
            }
        }
    }, true);
}

function testUpdateAdminAddress() {
    nebPayCall({
        func: "updateAdminAddress",
        args: ["n1SQe5d1NKHYFMKtJ5sNHPsSPVavGzW71Wy"],
    });
}

function testDeleteBadLines(ids) {
    nebPayCall({
        func: "deleteBadLines",
        args: [ids],
        listener: function (resp) {
            console.log(resp);
        }
    });
}

function testGetSize(listener) {
    nebPayCall({
        func: "getSize",
        listener: function (resp) {
            console.log(resp);
        }
    }, true);
}

function testSaveManyLines(lines) {
    nebPayCall({
        func: "saveManyLines",
        args: [lines],
        listener: function (resp) {
            console.log(resp);
        }
    });
}

function testAddComment1() {
    addComment(0, { comment: "haha", from: "me" });
}

function testAddComment2() {
    addComment(0, { comment: "haha2", from: "me2" });
}

function testThumbUp() {
    thumbUp(0);
}

function testGetComments() {
    getComments(0, function (resp) {
        console.log(resp);
    });
}