"use strict";
document.getElementById("submit").onclick = onCallClick;
document.getElementById("deploy").onclick = onDeployContract;


var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var Transaction = require("nebulas").Transaction;
var Unit = require("nebulas").Unit;
var neb = new Neb();
neb.setRequest(new HttpRequest(callbackUrl));
var NebPay = require("nebpay");
var nebPay = new NebPay();


function getWords() {
    var tmpaccount = Account.NewAccount();
    neb.api.getAccountState(tmpaccount.getAddressString()).then(function (state) {
        state = state.result || state;
        if (parseInt(state.balance) > 0) {
            console.log("temp account balance = " + state.balance);
            console.log("temp account nonce = " + state.nonce);
        }
        neb.api.call({
            chainID: 100,
            from: tmpaccount.getAddressString(),
            to: contractAddress,
            value: 0,
            nonce: parseInt(state.nonce) + 1,
            gasPrice: 1000000,
            gasLimit: 2000000,
            contract: {
                function: "get",
                args: ""
            }
        }).then(function (tx) {
            console.log(tx.result);
            if (tx.result === "") {
                throw new Error(contractAddress +
                    " is not a smart-contract address!");
            }
            for (let r of JSON.parse(tx.result)) {
                console.log(r);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }).catch(function (err) {
        console.log(err);
    });
}

getWords();

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
        callback: callbackUrl,
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
        callback: callbackUrl,
        listener: function (resp) {
            console.warn(resp);
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
        callback: callbackUrl,
        listener: null
    });
}

