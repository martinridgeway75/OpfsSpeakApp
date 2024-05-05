
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
        msg = "Database unavailable:\r\n" + (e).toString();
    }
    docEl("welcomeMsg").textContent = msg;
}

function firstReadDb() {
    //snippets depend on fetch of rubrics
    readFromDb({ fileName: "snippets" }, updateSnippetsData); //[]
}

async function readFromDb(obj, callBack) {
    const myWorker = new Worker("js/readDb.js");

    myWorker.onmessage = (e) => {
        callBack(e.data);
    }
    myWorker.postMessage(obj);
}

function updateSnippetsData(data) {
    appEditor.snippets = data || []; //onerror, data will be undefined
    initSnippets();

    if (!appEditor.db.snippets) {
        snippetHandlersOn();
        appEditor.db.snippets = true;
    }     
}






















/**********************/

//write
saveSnippetData();

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

