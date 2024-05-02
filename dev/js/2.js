//https://web.dev/articles/origin-private-file-system#use_the_origin_private_file_system_in_a_web_worker


//WORKER COMMS

//@Main thread

//WRITES:
//  data = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", obj: {}, fileUid: "123-456789-78987987" } //files in records and rubrics subDir.s
//  or
//  data = { obj: {}, fileName: "studentData" } //studentData, snippets, recordsIdx, rubricsIdx



    const myWorker = new Worker("js/2-worker.js");
    const obj = { obj: {}, fileName: "studentData" };

    function workerPostMsg(obj) {
        myWorker.postMessage(obj);
    }

    myWorker.onmessage = (e) => {
        console.log(e.data);
    }

    workerPostMsg(obj);