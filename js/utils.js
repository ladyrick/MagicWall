"use strict";

var nebPay = new (require("nebpay"))();

function nebPayCall(callObj, sim = false) {
    // { func: func, args: args, listener: listener }
    log("use nebPay " + (sim ? "simulateCall" : "call"));
    console.log(callObj);
    if (window.webExtensionWallet === "for nebulas") {
        return nebPay[sim ? "simulateCall" : "call"](
            contractAddress,
            0,
            callObj.func,
            callObj.args ? JSON.stringify(callObj.args) : "",
            {
                debug: false,
                callback: netConfig.callbackURL,
                listener: function (resp) {
                    if (!sim) {
                        console.warn("please check serialnumber instead of callback function.");
                    } else {
                        if (resp.execute_err === "" || resp.execute_err === "insufficient balance") {
                            resp.success = true;
                        } else {
                            resp.success = false;
                        }
                    }
                    if (callObj.listener)
                        return callObj.listener(resp);
                }
            });
    } else if (sim) {
        console.warn("nebPay extension not installed. using nebulas.js lib.");
        return nebSimCall(callObj);
    } else {
        console.error("nebPay extension not installed!");
        promptExtensionWallet();
        return "";
    }
}

function nebSimCall(callObj) {
    log("use nebulas.js call");
    console.log(callObj);
    var Nebulas = require("nebulas");
    var HttpRequest = Nebulas.HttpRequest;
    var Neb = Nebulas.Neb;
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
                function: callObj.func,
                args: callObj.args ? JSON.stringify(callObj.args) : "",
            }
        }).then(function (resp) {
            if (resp.execute_err === "" || resp.execute_err === "insufficient balance") {
                resp.success = true;
            } else {
                resp.success = false;
            }
            if (callObj.listener)
                return callObj.listener(resp);
        })
    });
    return "";
}

function log(str) {
    console.log("%c" + str.toString(), "color:red");
}

function promptExtensionWallet() {
    var pop = document.getElementById("pop");
    pop.classList.remove("vanish");
    pop.onclick = function () {
        pop.classList.add("vanish");
    }
}

function getWalletAddress() {
    if (window.walletAddress) return;
    nebPayCall({
        func: "whoami",
        listener: function (resp) {
            if (resp.success) {
                window.walletAddress = JSON.parse(resp.result);
            }
        }
    }, true);
}

function getLines(listener) {
    nebPayCall({ func: "get", listener: listener }, true);
}

function getByID(id, listener) {
    nebPayCall({ func: "getByID", args: [id], listener: listener }, true);
}

function saveLine(line, listener) {
    nebPayCall({
        func: "save",
        args: [line],
        listener: listener
    });
}

function addComment(id, comment, listener) {
    nebPayCall({
        func: "addComment",
        args: [id, comment],
        listener: listener
    });
}

function thumbUp(id, listener) {
    nebPayCall({
        func: "thumbUp",
        args: [id],
        listener: listener
    });
}
function thumbDown(id, listener) {
    nebPayCall({
        func: "thumbDown",
        args: [id],
        listener: listener
    });
}

function getComments(id, listener) {
    nebSimCall({
        func: "getComments",
        args: [id],
        listener: listener
    })
}

function deployContract(contractSourceCode, listener) {
    if (contractSourceCode === "") {
        console.error("Contract source code needed.");
        return;
    }
    nebPay.deploy(contractSourceCode, "js", "", {
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
