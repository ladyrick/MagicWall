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
        this.vault = new BigNumber(0);
        this.mainnet_or_testnet = Blockchain.block.height > 100000;
        //TODO: delete this 100 lines.
        while (this.size < 100) {
            this.storage.set(this.size, {
                to: this.size,
                from: this.size,
                say: this.size
            });
            this.size++;
        }
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
        } else if (typeof address !== "string" || Blockchain.verifyAddress(address) !== 87) {
            throw new Error("The address is not a valid user wallet address!");
        }
        this._transfer(address, this.vault);
        this._consolelog(this.vault.toString() + " wei remained.");
    }
    getVault() {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        this._consolelog(this.vault.toString() + " wei in this contract.");
        return this.vault.toString();
    }
    getSize() {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        return this.size;
    }
    deleteBadLines(ids) {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        if (ids.constructor !== Array) {
            throw new Error("ids must be an array of integers.");
        }

        for (var id of ids) {
            if (typeof id === "number" && id >= 0 && id < this.size) {
                id = parseInt(id);
                this._consolelog("deleted:");
                this._consolelog(this.storage.get(id));
                this.storage.set(id, this.storage.get(this.size - 1));
                this.storage.set(this.size - 1, { to: "deleted", from: "deleted", say: "deleted" });
                this.size--;
            }
        }
    }


    // user functions:
    save(line) {
        this._checkValue();
        if (typeof line === "object" && "to" in line && "from" in line && "say" in line) {
            this.storage.set(this.size, line);
            this.size++;
            this._consolelog("Saved in storage: " + JSON.stringify(line));
            this._consolelog("There are " + this.size + " lines in storage.");
        } else {
            this._consolelog("Received: " + JSON.stringify(line));
            throw new Error("An object is required. Format: {to:\"to\",from:\"from\",say:\"say\"}");
        }
    }
    get(number) {
        if (number === undefined) {
            number = 60;
        }
        if (typeof number !== "number") {
            throw new Error("Input type error! A number required.");
        }
        this._consolelog("Ask for " + number + " lines.");
        if (number > 60 && !this._validateAdmin()) {
            throw new Error("Only admin could get more than 60 lines.");
        }

        this._checkValue();

        if (number <= 0 || this.size === 0) {
            return [];
        }

        function randomPick(max, num) {
            if (num >= max) {
                return Array.from({ length: max }, (x, i) => i);
            }
            var temp = Array.from({ length: max }, (x, i) => i);
            for (var i = 0; i < num; i++) {
                var j = Math.floor(Math.random() * (max - i)) + i;
                if (i !== j) {
                    var t = temp[i];
                    temp[i] = temp[j];
                    temp[j] = t;
                }
            }
            return temp.slice(0, num);
        }

        var storage_get = [];
        for (let i of randomPick(this.size, number)) {
            var line = this.storage.get(i);
            line.id = i
            storage_get.push(line);
        }
        this._consolelog("Get from storage:");
        this._consolelog(storage_get);
        return storage_get;
    }
    getByID(id) {
        if (typeof id !== "number") {
            throw new Error("ID must be a positive integer!");
        }
        id = parseInt(id);
        if (id < 0) {
            throw new Error("ID must be a positive integer!");
        }
        if (id >= this.size) {
            throw new Error("Not found.");
        }
        var line = this.storage.get(id);
        line.id = id
        return line;
    }
}

module.exports = MagicWall;
