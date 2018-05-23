"use strict";
document.getElementById("submit").onclick = onCallClick;
document.getElementById("deploy").onclick = onDeployContract;


var nebPay = new (require("nebpay"))();
getWords();
function log(str) {
    console.log("%c" + str.toString(), "color:red");
}


function getWords() {
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
        listener: function (resp) {
            if (!resp.execute_err) {
                if (resp.result === "[]") {
                    log("got nothing.");
                }
                for (let r of JSON.parse(resp.result)) {
                    log(r);
                }
            } else {
                console.error(resp.execute_err);
            }
        }
    });
}

function onCallClick() {
    var to = contractAddress;
    var value = 0;
    var callFunction = "save";
    var callArgs = JSON.stringify([document.getElementById("text").value]);
    nebPay.call(to, value, callFunction, callArgs, {
        goods: {
            name: "add",
            desc: "add words"
        },
        callback: netConfig.callbackURL,
        listener: null
    });
}

function onDeployContract() {
    var contractSourceCode = document.getElementById("contract").value;
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
            document.getElementById("txhash").textContent
                = resp.txhash;
            document.getElementById("contractaddress").textContent
                = resp.contract_address;
        }
    });
}

function testWithdrawNASToAdmin() {
    var to = contractAddress;
    var value = 0;
    var callFunction = "withdrawNASToAdmin";
    var callArgs = JSON.stringify(["n1FF1nz6tarkDVwWQkMnnwFPuPKUaQTdptE"]);
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
                console.log(callArgs);
                console.log(resp);
            }
        });
    }
    testOneGet();
    testOneGet(2);
    testOneGet([1, 2]);
    testOneGet([-1, 100]);
    testOneGet([1, 2, 3]);
}