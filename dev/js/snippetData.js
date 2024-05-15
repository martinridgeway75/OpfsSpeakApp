
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
function writeToDb(obj, worker, callBack) {
    const workerName = "js/" + worker + "db.js";
    const myWorker = new Worker(workerName);

    myWorker.onmessage = (e) => {
        myWorker.terminate();
        if (callBack) {
            callBack(e.data);
        }
    }
    myWorker.postMessage(obj);
}

async function readOnlyDb(obj) {
    return new Promise( (resolve, reject) => {
        const myWorker = new Worker("js/readdb.js");

        myWorker.onmessage = async (e) => {
            myWorker.terminate();
            if (e.data) {
                resolve(e.data);
                return;
            }
            reject(0);
        }
        myWorker.postMessage(obj);
    }).catch( (e) => {
        reject(0);
    });
}

/********************/

function getSnippetsFromDb() {
    readOnlyDb({ fileName: "snippets" }).then( (data) => { //expect [] || undefined
        hasFetchedSnippets(data);
    });
}
function saveSnippetData() {
    exitSnippets();
    writeToDb({ obj: appEditor.snippets, fileName: "snippets" }, "write", hasSetSnippets); //expect <String> e || "OK"
}
/********************/

function hasFetchedSnippets(data) {
    appEditor.snippets = data || []; //onerror, data will be undefined
    initSnippets();

    if (!appEditor.db.snippets) {
        snippetHandlersOn();
        appEditor.db.snippets = true;
    }  
}
function hasSetSnippets(msg) {
    if (msg === "OK") {
        displayMsg("b");
        return;
    }
    displayMsg("a", msg);
}

/*****************************/

function buildTableForSnippets(bool) { //if true -> hardreload, if false -> update tags only (e.g. when rubrics are changed)
    var available = appEditor.snippets.map(function (el) { return el.snippetRubric; });
    var snippetsArr,
        i,
        ii;

    if (!available.length) {
        addNewSnippet();
        return;
    }
    for (i = 0; i < available.length; i++) {
        snippetsArr = appEditor.snippets[i].snippetDef;

        for (ii = 0; ii < snippetsArr.length; ii++) {
            if (bool === true) { createSnippetEl(i, ii, snippetsArr[ii].snippet); }
            tagSnippetRubrics(i, ii);
            tagSnippetSections(i, ii);
        }
    }
}
function tagSnippetRubrics(objIndex, snptIndex) {
    var targetRubricSelect = docEl("iu" + objIndex + "-" + snptIndex);
    var frag = document.createDocumentFragment();
    var allRubricKeys = Object.keys(appEditor.rubricsIndex);
    var allRubricTags = allRubricKeys.map(function (el) { return appEditor.rubricsIndex[el].rubricName; }); //get all avaiable rubric names
    var targetIndex,
        i;

    allRubricTags.unshift("any");
    allRubricTags = uniqueValues(allRubricTags);
    targetIndex = allRubricTags.indexOf(appEditor.snippets[objIndex].snippetRubric);

    if (targetIndex === -1) {
        appEditor.snippets[objIndex].snippetRubric = "any";
        targetIndex = 0;
    }

    for (i = 0; i < allRubricTags.length; i++) {
        var newOpt = document.createElement("option");

        newOpt.value = allRubricTags[i];
        newOpt.textContent = allRubricTags[i];
        frag.appendChild(newOpt);
    }
    emptyContent(targetRubricSelect);
    targetRubricSelect.appendChild(frag);
    targetRubricSelect.options[targetIndex].setAttribute("selected", true);
}
function tagSnippetSections(objIndex, snptIndex) {
    var targetSectionSelect = docEl("ia" + objIndex + "-" + snptIndex);
    var frag = document.createDocumentFragment();
    var allSectionTags = [];
    var targetIndex = -1;
    var i;
    var allRubricKeys = Object.keys(appEditor.rubricsIndex);
    var allRubricTags = allRubricKeys.map(function (el) { return appEditor.rubricsIndex[el].rubricName; }); //get all avaiable rubric names
    var rubricIndex = allRubricTags.indexOf(appEditor.snippets[objIndex].snippetRubric);

    if (rubricIndex !== -1) { allSectionTags = appEditor.rubricsIndex[allRubricKeys[rubricIndex]].sectionNames; }
    allSectionTags.unshift("any");
    allSectionTags = uniqueValues(allSectionTags);
    targetIndex = allSectionTags.indexOf(appEditor.snippets[objIndex].snippetDef[snptIndex].section);

    if (targetIndex === -1) {
        appEditor.snippets[objIndex].snippetDef[snptIndex].section = "any";
        targetIndex = 0;
    }
    for (i = 0; i < allSectionTags.length; i++) {
        var newOpt = document.createElement("option");

        newOpt.value = allSectionTags[i];
        newOpt.textContent = allSectionTags[i];
        frag.appendChild(newOpt);
    }
    emptyContent(targetSectionSelect);
    targetSectionSelect.appendChild(frag);
    targetSectionSelect.options[targetIndex].setAttribute("selected", true);
}
function getIndexOfSnippetObjFromRubricName(rubricName) {
    var index = -1;
    var len = appEditor.snippets.length;
    var i;

    for (i = 0; i < len; i++) {
        if (appEditor.snippets[i].snippetRubric === rubricName) {
            index = i;
            break;
        }
    }
    return index;
}
function addNewSnippet() {//pushes an empty element onto the "any" array and displays a new empty contentEditable
    var newEl = {};
    var relevantObjIndex = getIndexOfSnippetObjFromRubricName("any");
    var newIndex,
        temp;

    newEl.section = "any";
    newEl.snippet = ""; //null_placeholder_for_new_snippet

    if (relevantObjIndex === -1) {
        temp = { "snippetRubric": "any", "snippetDef": [] };
        appEditor.snippets.push(temp);
        relevantObjIndex = appEditor.snippets.length - 1;
    }
    appEditor.snippets[relevantObjIndex].snippetDef.push(newEl);
    newIndex = appEditor.snippets[relevantObjIndex].snippetDef.length - 1;
    createSnippetEl(relevantObjIndex, newIndex, ""); //new empty element
    tagSnippetRubrics(relevantObjIndex, newIndex);
    tagSnippetSections(relevantObjIndex, newIndex);
}
function fireUpdateSingleTagSnippetSection(elId) { //"iu" + objIndex + "-" + snptIndex
    var idxArr = buildTokens(elId.substring(2), "-");

    updateSingleTagSnippetSection(elId, idxArr);
}
function updateSingleTagSnippetSection(elId, idxArr) {
    var objIndex = idxArr[0];
    var snptIndex = idxArr[1];
    var newRef = docEl(elId).options[docEl(elId).selectedIndex].value;
    var targetSectionSelect = docEl("ia" + objIndex + "-" + snptIndex);
    var frag = document.createDocumentFragment();
    var allSectionTags = [];
    var targetIndex = -1;
    var i;
    var allRubricKeys = Object.keys(appEditor.rubricsIndex);
    var allRubricTags = allRubricKeys.map(function (el) { return appEditor.rubricsIndex[el].rubricName; }); //get all avaiable rubric names
    var rubricIndex = allRubricTags.indexOf(newRef);
    //get all section names from the associated rubric...resolves only when changes are SAVED
    if (rubricIndex !== -1) {
        allSectionTags = appEditor.rubricsIndex[allRubricKeys[rubricIndex]].sectionNames;
    }
    allSectionTags.unshift("any");
    allSectionTags = uniqueValues(allSectionTags);
    targetIndex = allSectionTags.indexOf(appEditor.snippets[objIndex].snippetDef[snptIndex].section);

    if (targetIndex === -1) {
        appEditor.snippets[objIndex].snippetDef[snptIndex].section = "any";
        targetIndex = 0;
    }

    for (i = 0; i < allSectionTags.length; i++) {
        var newOpt = document.createElement("option");

        newOpt.value = allSectionTags[i];
        newOpt.textContent = allSectionTags[i];
        frag.appendChild(newOpt);
    }
    emptyContent(targetSectionSelect);
    targetSectionSelect.appendChild(frag);
    targetSectionSelect.options[targetIndex].setAttribute("selected", true);
}
function updateSnippetRubricTags() { //when any rubric is updated, rubric and section tags on snippets need to be updated too
    buildTableForSnippets(false);
}
function removeOneSnippet(elId) {
    var indexes = elId.substring(2);
    //hide the snippet when "X" is clicked, clear the content and hide the tr
    hideEl("ii" + indexes);
    docEl("ix" + indexes).textContent = "";
}
function initSnippets() {
    if (appEditor.snippets.length) {
        appEditor.snptSNAPSHOT = JSON.stringify(appEditor.snippets);
    } else {
        appEditor.snptSNAPSHOT = "";
    }
    buildTableForSnippets(true);
}
function coldExitSnippets() {
    var snippetContent,
        i,
        ii;

    if (appEditor.hasOwnProperty("snptSNAPSHOT")) {
        if (appEditor.snptSNAPSHOT !== "") {
            appEditor.snippets = JSON.parse(appEditor.snptSNAPSHOT);
        }
    }
    if (appEditor.snippets.length) {
        for (i = 0; i < appEditor.snippets.length; i++) {
            for (ii = appEditor.snippets[i].snippetDef.length - 1; ii >= 0; ii--) {
                snippetContent = appEditor.snippets[i].snippetDef[ii].snippet;

                if (snippetContent === "" || snippetContent === "null_placeholder_for_new_snippet") {
                    appEditor.snippets[i].snippetDef.splice(ii, 1);
                }
            }
        }
        for (i = appEditor.snippets.length - 1; i >= 0; i--) {
            if (!appEditor.snippets[i].snippetDef.length) {
                appEditor.snippets.splice(i, 1);
            }
        }
    }
    exitSnippets();
}
function exitSnippets() {
    emptyContent(docEl("snptsTbd"));
    initSnippets();
}
function saveChangesToSnippets() {
    if (appEditor.snippets.length) {
        var isUpdated = updateAllSnippetData();

        if (isUpdated === true) { saveSnippetData(); } //TODO: hasSetSnippets() is the callback of hitDb()
    }
}
function updateAllSnippetData() {
    var tempArr = [];
    var targetNodes = docEl("snptsTbd").querySelectorAll("tr");
    var newSnippetDef,
        rubricsArr,
        elId,
        tempObj,
        newSnippetObj,
        idx,
        i;

    disableEl("snippetsContainer");
    appEditor.snippets = [];
    targetNodes.forEach(function (tr) {
        elId = (tr.id).substring(2);
        tempObj = {};
        tempObj.rubric = docEl("iu" + elId).options[docEl("iu" + elId).selectedIndex].value;
        tempObj.section = docEl("ia" + elId).options[docEl("ia" + elId).selectedIndex].value;
        //tempObj.content = docEl("ix" + elId).textContent;
        tempObj.content = fixNewlinesInContentEditable("ix" + elId);

        if (tempObj.content !== "" /* tempObj.content !=="null_placeholder_for_new_snippet"*/) { tempArr.push(tempObj); }
    });

    if (!tempArr.length) {
        enableEl("snippetsContainer");
        return true;
    }
    rubricsArr = tempArr.map(function (el) { return el.rubric; });
    rubricsArr = uniqueValues(rubricsArr);

    for (i = 0; i < rubricsArr.length; i++) {
        newSnippetObj = {};
        newSnippetObj.snippetRubric = rubricsArr[i];
        newSnippetObj.snippetDef = [];
        appEditor.snippets.push(newSnippetObj);
    }
    for (i = 0; i < tempArr.length; i++) {
        idx = getIndexOfSnippetObjFromRubricName(tempArr[i].rubric);
        newSnippetDef = {};
        newSnippetDef.section = tempArr[i].section;
        newSnippetDef.snippet = tempArr[i].content;
        appEditor.snippets[idx].snippetDef.push(newSnippetDef);
    }
    enableEl("snippetsContainer");
    return true;
}
function identifySnippet(el) {
    var elId;

    if (el.target !== el.currentTarget && el.target.nodeName !== "LABEL") { //because fires twice: once for label, and once for input
        elId = el.target.id;

        if (elId.substring(0, 2) === "ie") { removeOneSnippet(elId); }
    }
    el.stopPropagation();
}















