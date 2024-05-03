
//WORKER COMMS

//@subDir:
//  obj = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", obj: {}, fileUid: "123-456789-78987987" }} //files in records and rubrics subDir.s
//@root:
//  obj = { obj: {}, fileName: "studentData" } //studentData, snippets, recordsIdx, rubricsIdx
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

//@subDir:
//  obj = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }} //files in records and rubrics subDir.s

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

//@subDir:
//  obj = { fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }} //files in records and rubrics subDir.s
//@root:
//  obj = { fileName: "studentData" } //studentData, snippets, recordsIdx, rubricsIdx

function readFromDb(obj) {
    const myWorker = new Worker("js/readDb.js");

    myWorker.onmessage = (e) => {
        console.log(e.data);
    }
    myWorker.postMessage(obj);
}
//NOTE: props are EITHER || OR 
// const idxObj = { fileName: "recordsIdx" };
// const recordObj = { subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }};

// readFromDb(idxObj);
// readFromDb(recordObj);