
function docEl(id) {
    return document.getElementById(id); // || null
}

function displayDbQuota() {
    let msg = "";

    try {
        navigator.storage.estimate().then((estimate) => {
            const usage = "Used: " + ((estimate.usage / 1024 / 1024).toFixed(1)) + "MB";
            const quota = "Available: " + ((estimate.quota / 1024 / 1024).toFixed(1)) + "MB";

            msg = "Database quota\r\n" + usage + "\r\n" + quota;
        });
    } catch (e) {
        msg = "Database unavailable!\r\n" + (e).toString();
    }
    docEl("welcomeMsg").textContent = msg;
}


/*******ref***************/

//read
getRecordsIndexFromDbAtInit();
fetchSelectedRecordsForDownload();
fetchSingleRecordForDownload();

//write
pushRecordsToDb();
saveUpdatedRecords();

//delete
deleteRecordsViaMap();

/**********************/

function hitDb(obj, worker, callBack) { //worker: "read", "write", "delete"
    const workerName = "js/" + worker + "db.js";
    const myWorker = new Worker(workerName);

    myWorker.onmessage = (e) => {
        callBack(e.data);
    }
    myWorker.postMessage(obj);
}
//@write
// const obj = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", obj: {}, fileUid: "" }};
// hitDb(obj, "write", callBack);

//@delete
// const obj = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["","",""] }}
// hitDb(obj, "delete", callBack);

//@read
// const obj = { fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["","",""] }} //read multiple records during print/pdf
// hitDb(obj, "read", callBack);
