//https://web.dev/articles/origin-private-file-system#use_the_origin_private_file_system_in_a_web_worker


//WORKER COMMS

//@Main thread
//NOTE: obj is always an object
const myWorker = new Worker("js/2-worker.js");
    const obj = {payload: "TEST 2 message"};

    function wrkrPostMsg(obj) {
        myWorker.postMessage(obj);
    }

    myWorker.onmessage = function(e) {
        console.log(e.data);
    }

    wrkrPostMsg(obj);