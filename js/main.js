"use strict";

getLines(function (resp) {
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
});