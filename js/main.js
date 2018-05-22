"use strict";
document.getElementById("submit").onclick = onCallClick;
document.getElementById("deploy").onclick = onDeployContract;


var nebPay = new (require("nebpay"))();
getWords();
function log(str) {
    console.log("%c" + str, "color:red");
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
                for (let r of JSON.parse(resp.result)) {
                    log(r);
                }
            } else {
                console.error("execute err.");
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
    var callArgs = "";
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