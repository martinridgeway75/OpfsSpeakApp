
//DB COMMS
/**********************/
//read
getRecordsIndexFromDbAtInit();
getRubricIndexesFromDb();
getStudentsFromDb();
getSnippetsFromDb();
fetchSelectedRecordsForDownload();
fetchSingleRecordForDownload();
getSelectedRubric();

//write
pushRecordsToDb();
proceedWithRubricUpdateExisting();
proceedWithRubricSaveAsNew();
saveStudentData();
saveSnippetData();
saveUpdatedRecords();


//delete
deleteRecordsViaMap();
removeRubrikFromDb();


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
function deleteFromDb() {
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
function readFromDb(obj) {
    const myWorker = new Worker("js/readDb.js");

    myWorker.onmessage = (e) => {
        console.log(e.data);
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