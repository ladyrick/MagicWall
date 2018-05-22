"use strict";

class MagicWall {
    constructor() {
        LocalContractStorage.defineProperties(this, {
            size: null,
            adminAddress: null,
            feeRate: {
                stringify: function (obj) {
                    return obj.toString();
                },
                parse: function (str) {
                    return new BigNumber(str);
                }
            },
            vault: {
                stringify: function (obj) {
                    return obj.toString();
                },
                parse: function (str) {
                    return new BigNumber(str);
                }
            }
        });
        LocalContractStorage.defineMapProperty(this, "storage");
    }
    init() {
        this.size = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.feeRate = new BigNumber(0.05);
        this.vault = new BigNumber(0);
    }

    // admin functions:
    _validateAdmin() {
        if (Blockchain.transaction.from === this.adminAddress) {
            return true;
        } else {
            throw new Error("Permission denied.");
            return false;
        }
    }
    _transfer(address, value) {
        var result = Blockchain.transfer(address, value);
        if (!result) {
            throw new Error("Transfer failed.");
            return;
        }
        console.log("Transfer result: ", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value.toString()
            }
        });
        this.vault.sub(value);
        console.log(value.toString() + " wei transfered to " + address);
    }
    updateAdminAddress(address) {
        if (!this._validateAdmin()) {
            return;
        }
        var addressType = Blockchain.verifyAddress(address)
        if (addressType === 87) {
            console.log("This address is a user wallet address.")
            this.adminAddress = address;
        } else if (addressType === 88) {
            throw new Error("This address is a smart-contract address! A user wallet address is required.");
        } else {
            throw new Error("This address is invalid! A user wallet address is required.");
        }
    }
    updateFeeRate(newFeeRate) {
        if (!this._validateAdmin()) {
            return;
        }
        this.feeRate = new BigNumber(newFeeRate);
        console.log("Fee rate has been updated to " + newFeeRate);
    }
    withdrawNASToAdmin(address) {
        if (!this._validateAdmin()) {
            return;
        }
        if (!address || Blockchain.verifyAddress(address) !== 87) {
            address = this.adminAddress;
        }
        this._transfer(address, this.vault);
    }


    // user functions:
    save(words) {
        this.storage.set(this.size, words);
        this.size++;
        var value = new BigNumber(Blockchain.transaction.value);
        this.vault.plus(value);
        console.log("saved: " + words);
    }
    get() {
        var storage_get = [];
        for (let i = 0; i < this.size; i++) {
            storage_get.push(this.storage.get(i));
        }
        console.log("get: ");
        console.log(storage_get);
        return storage_get;
    }
}

module.exports = MagicWall;
