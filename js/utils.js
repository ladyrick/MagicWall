"use strict";

var nebPay = new (require("nebpay"))();

function log(str) {
    console.log("%c" + str.toString(), "color:red");
}

function getLines(listener) {
    var to = contractAddress;
    var value = 0;
    var callFunction = "get";
    var callArgs = "";
    nebPay.simulateCall(to, value, callFunction, callArgs, {
        goods: {
            name: "get",
            desc: "get words"
        },
        callback: netConfig.callbackURL,
        listener: listener
    });
}

function getLinesUsingNebulasJS(listener) {
    var HttpRequest = require("nebulas").HttpRequest;
    var Neb = require("nebulas").Neb;
    var neb = new Neb();
    neb.setRequest(new HttpRequest(netConfig.callbackURL));

    // Just a random account. Not admin account.
    // Could be replaced to any valid account address.
    var tmpaccount = "n1aWvANFRN4FU1CVhxaMXCyc5vs73ikvJmy";
    neb.api.getAccountState(tmpaccount).then(function (state) {
        state = state.result || state;
        neb.api.call({
            chainID: netConfig.chainID,
            from: tmpaccount,
            to: contractAddress,
            value: 0,
            nonce: parseInt(state.nonce) + 1,
            gasPrice: 1000000,
            gasLimit: 2000000,
            contract: {
                function: "get",
                args: ""
            }
        }).then(listener)
            .catch(function (err) {
                console.error(err);
            });
    }).catch(function (err) {
        console.error(err);
    });
}

function saveLine(line, listener) {
    var to = contractAddress;
    var value = 0;
    var callFunction = "save";
    var callArgs = JSON.stringify([line]);
    log(callArgs);
    nebPay.call(to, value, callFunction, callArgs, {
        goods: {
            name: "add",
            desc: "add words"
        },
        callback: netConfig.callbackURL,
        listener: listener
    });
}

function deployContract(contractSourceCode, listener) {
    if (contractSourceCode === "") {
        console.error("Contract source code needed.");
        return;
    }
    var serialNumber = nebPay.deploy(contractSourceCode, "js", "", {
        goods: {
            name: "deploy",
            desc: "deploy smart-contract"
        },
        callback: netConfig.callbackURL,
        listener: function (resp) {
            log("txhash: " + resp.txhash);
            log("contractaddress: " + resp.contract_address);
            if (typeof (listener) === "function") {
                listener(resp);
            }
        }
    });
}

function testSaveLine1() {
    saveLine({ to: 1, from: 2, say: 3 });
}
function testSaveLine2() {
    saveLine({ to: 1, from: 2 });
}

function testSaveLine3() {
    saveLine(JSON.stringify({ to: 1, from: 2, say: 3 }));
}

function testWithdrawNASToAdmin() {
    var to = contractAddress;
    var value = 0;
    var callFunction = "withdrawNASToAdmin";
    var callArgs = JSON.stringify([0]);
    nebPay.call(to, value, callFunction, callArgs, {
        goods: {
            name: "withdraw",
            desc: "withdraw NAS to admin"
        },
        callback: netConfig.callbackURL,
        listener: null
    });
}

function testGetVault() {
    var to = contractAddress;
    var value = 0;
    var callFunction = "getVault";
    var callArgs = "";
    nebPay.simulateCall(to, value, callFunction, callArgs, {
        goods: {
            name: "testGetVault",
            desc: "test getVault function"
        },
        callback: netConfig.callbackURL,
        listener: function (resp) {
            if (!resp.execute_err) {
                log("vault: " + JSON.parse(resp.result));
            }
        }
    });
}

function testUpdateAdminAddress() {
    var to = contractAddress;
    var value = 0;
    var callFunction = "updateAdminAddress";
    var callArgs = JSON.stringify(["n1SQe5d1NKHYFMKtJ5sNHPsSPVavGzW71Wy"]);
    nebPay.call(to, value, callFunction, callArgs, {
        goods: {
            name: "testUpdateAdminAddress",
            desc: "test updateAdminAddress function"
        },
        callback: netConfig.callbackURL,
        listener: null
    });
}

function testGet() {
    function testOneGet(arg) {
        var to = contractAddress;
        var value = 0;
        var callFunction = "get";
        var callArgs = arg === undefined ? "" : JSON.stringify([arg]);
        nebPay.simulateCall(to, value, callFunction, callArgs, {
            goods: {
                name: "testGet",
                desc: "test get function"
            },
            callback: netConfig.callbackURL,
            listener: function (resp) {
                log(callArgs);
                console.log(resp);
            }
        });
    }
    testOneGet();
    testOneGet(2);
    testOneGet(0);
    testOneGet(-1);
    testOneGet(100);
    testOneGet([1, 2, 3]);
}

function testGetByID(id, listener) {
    var to = contractAddress;
    var value = 0;
    var callFunction = "getByID";
    var callArgs = JSON.stringify([id]);
    nebPay.simulateCall(to, value, callFunction, callArgs, {
        goods: {
            name: "testGetByID",
            desc: "test getByID function"
        },
        callback: netConfig.callbackURL,
        listener: function (resp) {
            log(callArgs);
            console.log(resp);
        }
    });
}

function testDeleteBadLines(ids, listener) {
    var to = contractAddress;
    var value = 0;
    var callFunction = "deleteBadLines";
    var callArgs = JSON.stringify([ids]);
    nebPay.call(to, value, callFunction, callArgs, {
        goods: {
            name: "testDeleteBadLines",
            desc: "test deleteBadLines function"
        },
        callback: netConfig.callbackURL,
        listener: function (resp) {
            log(callArgs);
            console.log(resp);
        }
    });
}

function testGetSize(listener){
    var to = contractAddress;
    var value = 0;
    var callFunction = "getSize";
    var callArgs = "";
    nebPay.simulateCall(to, value, callFunction, callArgs, {
        goods: {
            name: "testGetSize",
            desc: "test getSize function"
        },
        callback: netConfig.callbackURL,
        listener: function (resp) {
            console.log(resp);
        }
    });
}