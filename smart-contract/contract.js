"use strict";

class DApp {
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
            comment_count: null
        });
        LocalContractStorage.defineMapProperty(this, "storage");
        LocalContractStorage.defineMapProperty(this, "comments");
    }
    init() {
        this.size = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.vault = new BigNumber(0);
        this.comment_count = 0;
    }

    // private functions:
    _validateAdmin() {
        if (Blockchain.transaction.from === this.adminAddress) {
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
    }
    _transfer(address, value) {
        var result = Blockchain.transfer(address, value);
        if (!result) {
            throw new Error("Transfer failed.");
            return;
        }
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value.toString()
            }
        });
        this.vault = this.vault.sub(value);
    }
    _saveOneLine(line) {
        if (typeof line === "object" && "to" in line && "from" in line && "say" in line) {
            line.commentIDs = [];
            line.thumbs = [];
            this.storage.set(this.size, line);
            this.size++;
        } else {
            throw new Error("An object is required. Format: {to:\"to\",from:\"from\",say:\"say\"}");
        }
    }
    _pushComment(comment) {
        if ("comment" in comment && "from" in comment) {
            this.comments.set(this.comment_count, comment);
            this.comment_count++;
            return this.comment_count - 1;
        } else {
            throw new Error("The comment is invalid.");
        }
    }
    _checkedID(id) {
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
        return id;
    }
    _getByID(id) {
        var line = this.storage.get(id);
        return {
            private: line,
            public: {
                id: id,
                to: line.to,
                say: line.say,
                from: line.from,
                comment_count: line.commentIDs.length,
                thumb_count: line.thumbs.length,
                is_thumb_up: line.thumbs.indexOf(Blockchain.transaction.from) !== -1
            }
        };
    }

    // admin functions:
    updateAdminAddress(address) {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        var addressType = Blockchain.verifyAddress(address)
        if (addressType === 87) {
            this.adminAddress = address;
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
    }
    getVault() {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
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

        for (var id of ids.sort((i, j) => j - i)) {
            if (typeof id === "number" && id >= 0 && id < this.size) {
                id = parseInt(id);
                this.storage.set(id, this.storage.get(this.size - 1));
                this.storage.set(this.size - 1, { to: "deleted", from: "deleted", say: "deleted" });
                this.size--;
            }
        }
    }
    saveManyLines(lines) {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        if (lines.constructor !== Array) {
            throw new Error("lines must be an array of integers.");
        }
        for (var line of lines) {
            this._saveOneLine(line);
        }
    }
    getPrivateByID(id) {
        if (!this._validateAdmin()) {
            return;
        }
        this._checkValue();
        var id = this._checkedID(id);
        return this._getByID(id).private;
    }


    // user functions:
    whoami() {
        this._checkValue();
        return Blockchain.transaction.from;
    }
    save(line) {
        this._checkValue();
        this._saveOneLine(line);
    }
    get(number) {
        if (number === undefined) {
            number = 60;
        }
        if (typeof number !== "number") {
            throw new Error("Input type error! A number required.");
        }
        number = parseInt(number);

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
        for (let id of randomPick(this.size, number)) {
            storage_get.push(this._getByID(id).public);
        }
        return storage_get;
    }
    getByID(id) {
        this._checkValue();
        var id = this._checkedID(id);
        return this._getByID(id).public;
    }
    addComment(id, comment) {
        this._checkValue();
        var id = this._checkedID(id);
        var line = this._getByID(id).private;
        line.commentIDs.push(this._pushComment(comment));
        this.storage.set(id, line);
    }
    getComments(id) {
        this._checkValue();
        var id = this._checkedID(id);
        var line = this._getByID(id).private;
        var comments = [];
        for (var cid of line.commentIDs) {
            comments.push(this.comments.get(cid));
        }
        return comments;
    }
    thumbUp(id) {
        this._checkValue();
        var id = this._checkedID(id);
        var line = this._getByID(id).private;
        if (line.thumbs.indexOf(Blockchain.transaction.from) === -1) {
            line.thumbs.push(Blockchain.transaction.from);
            this.storage.set(id, line);
        }
    }
    thumbDown(id) {
        this._checkValue();
        var id = this._checkedID(id);
        var line = this._getByID(id).private;
        var index = line.thumbs.indexOf(Blockchain.transaction.from);
        if (index !== -1) {
            line.thumbs.splice(index, 1);
            this.storage.set(id, line);
        }
    }
}

module.exports = DApp;
