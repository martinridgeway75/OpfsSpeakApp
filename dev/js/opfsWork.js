
//DB COMMS

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

function firstReadDatabase() {
    readFromDb({ fileName: "recordsIdx" }, "recordsIndex"); //[]
    readFromDb({ fileName: "rubricsIdx" }, "rubricsIndex"); //{} !!
    readFromDb({ fileName: "studentData" }, "studentData"); //[]
    readFromDb({ fileName: "snippets" }, "snippets"); //[]
}



/**********************/

//read
// getRecordsIndexFromDbAtInit();
// getRubricIndexesFromDb();
// getStudentsFromDb();
// getSnippetsFromDb();
fetchSelectedRecordsForDownload();
fetchSingleRecordForDownload();
getSelectedRubric();

//write
saveStudentData();
saveSnippetData();

pushRecordsToDb();
proceedWithRubricUpdateExisting();
proceedWithRubricSaveAsNew();
saveUpdatedRecords();


//delete
deleteRecordsViaMap();
removeRubrikFromDb();

/**********************/

//individual files in records and rubrics subDir.s
//  obj = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", obj: {}, fileUid: "123-456789-78987987" }}
//studentData, snippets, recordsIdx, rubricsIdx
//  obj = { obj: {}, fileName: "studentData" }
function writeToDb(obj) {
    const myWorker = new Worker("js/writeDb.js");

    myWorker.onmessage = (e) => {
        console.log(e.data);
    }
    myWorker.postMessage(obj);
}
// const obj = { obj: {index1: "123-456789-78987987"}, fileName: "recordsIdx", subDir: { path: "records", obj: {b:"2"}, fileUid: "123-456789-78987987" }};
// writeToDb(obj);

/**********************/

//individual files in records and rubrics subDir.s
//  obj = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }}
function deleteFromDb(obj) {
    const myWorker = new Worker("js/deleteDb.js");

    myWorker.onmessage = (e) => {
        console.log(e.data);
    }
    myWorker.postMessage(obj);
}
// const obj = { obj: {index1: "123-456789-78987987"}, fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }};
// deleteFromDb(obj);

/**********************/

//individual files in records and rubrics subDir.s
//  obj = { fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }}
//studentData, snippets, recordsIdx, rubricsIdx
//  obj = { fileName: "studentData" }
async function readFromDb(obj, prop) {
    const myWorker = new Worker("js/readDb.js");

    myWorker.onmessage = (e) => {
        if (e.data == undefined)  { return; }
        if (obj?.subDir) {
            //these are arrays of records or rubrics
            return;
        }
        if (prop === "recordsIndex") {
            appEditor[prop] = flattenRecords(e.data);
            return;
        }
        appEditor[prop] = e.data;
    }
    myWorker.postMessage(obj);
}
// either
// studentData, snippets, recordsIdx, rubricsIdx
// const idxObj = { fileName: "recordsIdx" };
// readFromDb(idxObj);

// or
//individual files in records and rubrics subDir.s
// const recordObj = { subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }};
// readFromDb(recordObj);