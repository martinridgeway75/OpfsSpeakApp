
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
function hitDb(obj, worker, callBack) {
    const workerName = "js/" + worker + "db.js";
    const myWorker = new Worker(workerName);

    myWorker.onmessage = (e) => {
        callBack(e.data);
    }
    myWorker.postMessage(obj);
}

/********************/

//getSelectedRubric();
//hitDb({ fileName: "rubricsIdx", subDir: { path: "rubrics", fileUidsArr: ["","",""] } }, "read", hasFetchedRubric); //expect [] || undefined

//getRubricIndexesFromDb();
//hitDb({ fileName: "rubricsIdx" }, "read", hasFetchedRubricIdx); //expects {} || undefined

// proceedWithRubricUpdateExisting();
// proceedWithRubricSaveAsNew();
//hitDb({ obj: {}, fileName: "rubricsIdx", subDir: { path: "rubrics", obj: {}, fileUid: "" }}, "write", hasSetRubrics); //expect <String> e || "OK"

//removeRubrikFromDb();
//hitDb({ obj: {}, fileName: "recordsIdx", subDir: { path: "rubrics", fileUidsArr: ["","",""] }}, "write", hasRemovedRubric);  //expect <String> e || "OK"

/********************/


function hasFetchedRubric(data) {

    //TODO: rubric {} to be placed in a single [] ?

    // appEditor.snippets = data || {}; //onerror, data will be undefined
    // initSnippets();

    // if (!appEditor.db.snippets) {
    //     snippetHandlersOn();
    //     appEditor.db.snippets = true;
    // }  
}

function hasFetchedRubricIdx(data) {
    // appEditor.snippets = data || {}; //onerror, data will be undefined
    // initSnippets();

    // if (!appEditor.db.snippets) {
    //     snippetHandlersOn();
    //     appEditor.db.snippets = true;
    // }  
}


function hasSetRubrics(msg) { //TODO: callback of hitDb...was formerly: ()
    // if (msg === "OK") {
    //     exitSnippets();
    //     displayMsg("b");
    //     return;
    // }
    // displayMsg("a", msg);
}

function hasRemovedRubric(msg) { //TODO: callback of hitDb...was formerly: ()



}