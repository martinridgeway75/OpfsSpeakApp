
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

function firstReadDb() {
    readFromDb({ fileName: "studentData" }, "studentData"); //[]
}



/**********************/

//write
saveStudentData();

/**********************/

function writeToDb(obj) {
    const myWorker = new Worker("js/writeDb.js");

    myWorker.onmessage = () => {
        //callback(); //e.g. update UI
    }
    myWorker.postMessage(obj);
}
// const obj = { obj: {}, fileName: "studentData" };
// writeToDb(obj);

/**********************/

async function readFromDb(obj, prop) {
    const myWorker = new Worker("js/readDb.js");

    myWorker.onmessage = (e) => {
        if (e.data == undefined)  { return; }
        if (obj?.subDir) {
            //these are arrays of records or rubrics
            return;
        }
        appEditor[prop] = e.data;
        //callback(); //e.g. update UI
    }
    myWorker.postMessage(obj);
}
// const obj = { fileName: "studentData" };
// readFromDb(obj);