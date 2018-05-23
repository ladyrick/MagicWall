"use strict";

class MagicWall {
    constructor() {
        LocalContractStorage.defineProperties(this, {
            size: null,
            adminAddress: null,
            vault: {
                stringify: function (obj) {
                    return obj.toString();
                },
                parse: function (str) {
                    return new BigNumber(str);
                }
            },
            mainnet_or_testnet: null
        });
        LocalContractStorage.defineMapProperty(this, "storage");
    }
    init() {
        this.size = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.feeRate = new BigNumber(0.05);
        this.vault = new BigNumber(0);
        this.mainnet_or_testnet = Blockchain.block.height > 100000;
    }

    // admin functions:
    _consolelog() {
        if (this.mainnet_or_testnet) {
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(null, args);
    }
    _validateAdmin() {
        if (Blockchain.transaction.from === this.adminAddress) {
            this._consolelog("admin validated successfully.");
            return true;
        } else {
            throw new Error("Permission denied.");
            return false;
        }
    }
    _checkValue() {
        var value = new BigNumber(Blockchain.transaction.value);
        if (value.toString() !== "0") {
            this.vault = this.vault.plus(value);
        }
        this._consolelog("Entry value: " + value.toString() + " wei.");
    }
    _transfer(address, value) {
        var result = Blockchain.transfer(address, value);
        if (!result) {
            throw new Error("Transfer failed.");
            return;
        }
        this._consolelog("Transfer result: ", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value.toString()
            }
        });
        this.vault = this.vault.sub(value);
        this._consolelog(value.toString() + " wei transfered to " + address);
    }
    updateAdminAddress(address) {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        var addressType = Blockchain.verifyAddress(address)
        if (addressType === 87) {
            this.adminAddress = address;
            this._consolelog("Admin address updated to " + this.adminAddress);
        } else if (addressType === 88) {
            throw new Error("This address is a smart-contract address! A user wallet address is required.");
        } else {
            throw new Error("This address is invalid! A user wallet address is required.");
        }
    }
    withdrawNASToAdmin(address) {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        if (!address) {
            address = this.adminAddress;
        } else if (typeof (address) !== "string" || Blockchain.verifyAddress(address) !== 87) {
            throw new Error("The address is not a valid user wallet address!");
        }
        this._transfer(address, this.vault);
        this._consolelog(this.vault.toString() + " remained.");
    }
    getVault() {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        this._consolelog(this.vault.toString() + " wei in this contract.");
        return this.vault.toString();
    }


    // user functions:
    save(line) {
        this._checkValue();
        this.storage.set(this.size, line);
        this.size++;
        this._consolelog("Saved in storage: " + line);
        this._consolelog("There are " + this.size + " lines in storage.");
    }
    get(range) {
        var minrange, maxrange;
        if (range === undefined) {
            minrange = 0;
            maxrange = this.size;
        } else if (typeof (range) === "number") {
            minrange = this.size - range;
            maxrange = this.size;
        } else if (range.constructor === Array && range.length === 2) {
            minrange = range[0];
            maxrange = range[1];
        } else {
            throw new Error("Range is not valid. A number or an array (length=2) is required.");
        }
        this._checkValue();

        minrange = minrange > 0 ? minrange : 0;
        maxrange = maxrange < this.size ? maxrange : this.size;

        this._consolelog("Minrange = " + minrange);
        this._consolelog("Maxrange = " + maxrange);
        var storage_get = [];
        for (let i = minrange; i < maxrange; i++) {
            storage_get.push(this.storage.get(i));
        }
        this._consolelog("Get from storage:");
        this._consolelog(storage_get);
        return storage_get;
    }
}

module.exports = MagicWall;
