//https://web.dev/articles/origin-private-file-system#use_the_origin_private_file_system_in_a_web_worker


//WORKER COMMS

//@subDir:
//  obj = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", obj: {}, fileUid: "123-456789-78987987" }} //files in records and rubrics subDir.s
//@root:
//  obj = { obj: {}, fileName: "studentData" } //studentData, snippets, recordsIdx, rubricsIdx
function writeToDb(obj) {
    const myWorker = new Worker("js/2-worker.js");

    myWorker.onmessage = (e) => {
        //message returning from worker
        console.log(e.data);
    }
    myWorker.postMessage(obj);
}

//@subDir:
//  obj = { fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: ["123-456789-78987987"] }} //files in records and rubrics subDir.s
//@root:
//  obj = { fileName: "studentData" } //studentData, snippets, recordsIdx, rubricsIdx

function readFromDb(obj) {
    const myWorker = new Worker("js/3-worker.js");

    myWorker.onmessage = (e) => {
        //message returning from worker
        console.log(e.data);
    }
    myWorker.postMessage(obj);
}