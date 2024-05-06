
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

/*************************/

function proceedWithRubricSaveAsNew(rubricName, uid) {
    const dbCtx = "" + appEditor.settings.dbCtx;
    const postData = convertToRubricObj(rubricName);
    const objPath = dbCtx + "/" + uid + "/savedRubricsIndex/";
    const newPostKey = push(child(ref(db), objPath)).key;
    const idxObj = idxObjFromRubricPostData(postData);
    const newObjKeyPath = dbCtx + "/" + uid + "/savedRubrics/" + newPostKey;
    const objIdxPath = dbCtx + "/" + uid + "/savedRubricsIndex/" + newPostKey;
    const updates = {};
    let newShareKey;

    updates[newObjKeyPath] = postData;
    updates[objIdxPath] = idxObj;

    update(ref(db), updates).then(() => {
        rubricCommitted(newPostKey, idxObj, newShareKey);
    }).catch((error) => {
        chkPermission(error);
        displayMsg("d", error);
        enableEl("editRubric");
    });
}
function proceedWithRubricUpdateExisting(rubricName, key, uid) { //#1. Rubric exists and needs to be updated
    const dbCtx = "" + appEditor.settings.dbCtx;
    const postData = convertToRubricObj(rubricName);
    const idxObj = idxObjFromRubricPostData(postData);
    const newObjKeyPath = dbCtx + "/" + uid + "/savedRubrics/" + key;
    const objIdxPath = dbCtx + "/" + uid + "/savedRubricsIndex/" + key;
    const updates = {};
    let newShareKey;

    updates[objIdxPath] = idxObj;
    updates[newObjKeyPath] = postData;

    update(ref(db), updates).then(() => {
        rubricCommitted(key, idxObj, newShareKey);
    }).catch((error) => {
        chkPermission(error);
        displayMsg("d", error);
        enableEl("editRubric");
    });
}
function removeRubrikFromDb(key) {
    const ctx = "" + appEditor.settings.dbCtx + "/" + auth.currentUser.uid;
    const newObjKeyPath = ctx + "/savedRubrics/" + key;
    const objIdxPath = ctx + "/savedRubricsIndex/" + key;
    const updates = {};

    updates[objIdxPath] = null;
    updates[newObjKeyPath] = null;

    update(ref(db), updates).then(() => {
        rubrikDestroyed(key);
    }).catch((error) => {
        chkPermission(error);
    });
}
function rubricsGetSaved(path) {
    onValue(ref(db, path), (snapshot) => {
        appEditor.rubricsIndex = snapshot.val() || {};
        appEditor.db.rubrics = true;

        if (!isObjEmpty(appEditor.rubricsIndex)) {
            showEl("ruLoadSelected");
            loadRubriks();
        }
        rubrikHandlersOn();

    }, (error) => {
        chkPermission(error);
    }, {
        onlyOnce: true
    });
}
function getRubricIndexesFromDb() {  
    const path = "" + appEditor.settings.dbCtx + "/" + auth.currentUser.uid + "/savedRubricsIndex";

    rubricsGetSaved(path);
}
//@grader
function getSelectedRubric(idx) {
    const path = "" + appEditor.settings.dbCtx + "/" + auth.currentUser.uid + "/savedRubrics/" + idx;
    
    onValue(ref(db, path), (snapshot) => {
        appEditor.grader.loadedRubric = [];
        appEditor.grader.loadedRubric.push(snapshot.val());
        showSectionsForSelectedRubric(idx);
        finishInit();
    }, (error) => {
        chkPermission(error);
        displayMsg("y", error);
    }, {
        onlyOnce: true
    });
}
//@records
function getSelectedRubrik(rubricNameKey) {
    if (rubricNameKey === "" || rubricNameKey == undefined) { displayMsg("f"); return; }

    const uid = auth.currentUser.uid;    
    let selectedRubik;
    let path = "" + appEditor.settings.dbCtx + "/" + uid + "/savedRubrics/" + rubricNameKey;

    onValue(ref(db, path), (snapshot) => {
        selectedRubik = snapshot.val();

        if (selectedRubik !== null) {
            appEditor.appEditRecords.loadedRubric = [];
            appEditor.appEditRecords.loadedRubric.push(selectedRubik);
            appEditor.appEditRecords.loadedRubric[0].rubricKey = rubricNameKey;
            showLoadedRubrik();
        }
    }, (error) => {
        chkPermission(error);
    }, {
        onlyOnce: true
    });
}

//RUBRICS

function rubricSaveAsNew(rubricName, uid) { //#2. Rubric is new and needs to be created || Rubric exists, BUT is being created as a copy of itself WITH A NEW NAME
    // if (docEl("shareThisRubric").checked !== true) {
        proceedWithRubricSaveAsNew(rubricName, uid, false);
        // return;
    // }
    // window.mscConfirm({
    //     title: '',
    //     subtitle: 'You have opted to share this rubric with all users. Is that correct?',
    //     cancelText: 'Cancel',
    //     onOk: function () {
    //         proceedWithRubricSaveAsNew(rubricName, uid, true);
    //     },
    //     onCancel: function () {
    //         return;
    //     }
    // });
}
function rubricUpdateExisting(rubricName, key, uid) { //#2. Rubric is new and needs to be created || Rubric exists, BUT is being created as a copy of itself WITH A NEW NAME
    // if (docEl("shareThisRubric").checked !== true) {
        proceedWithRubricUpdateExisting(rubricName, key, uid, false);
    //     return;
    // }
    // window.mscConfirm({
    //     title: '',
    //     subtitle: 'You have opted to share this rubric with all users. Is that correct?',
    //     cancelText: 'Cancel',
    //     onOk: function () {
    //         proceedWithRubricUpdateExisting(rubricName, key, uid, true);
    //     },
    //     onCancel: function () {
    //         return;
    //     }
    // });
}
function commitRubrik() {
    var uid = auth.currentUser.uid;
    var chkd = allChksPassForNewRubrik();
    var rubricName = docEl("ruNameNewtxt").value;
    var relevantKey;

    if (appEditor.editorIsOpen.rubric === false) { return; }
    if (chkd !== "true") {
        displayMsg("c", chkd);
        return;
    }
    disableEl("editRubric");

    if (appEditor.appEditRecords.loadedRubric[0] == undefined) {
        rubricSaveAsNew(rubricName, uid); //undefined if this is a new rubric...
        return;
    }
    relevantKey = appEditor.appEditRecords.loadedRubric[0].rubricKey;
    window.mscConfirm({
        title: '',
        subtitle: 'What would you like to do?',
        okText: 'Update this rubric',
        cancelText: 'Save as new rubric',
        onOk: function () {
            rubricUpdateExisting(rubricName, relevantKey, uid);
        },
        onCancel: function () {
            rubricName += "-" + window.Date.now();
            rubricSaveAsNew(rubricName, uid);
        }
    });
}
function newRubrik() {
    appEditor.editorIsOpen.rubric = true;
    appEditor.appEditRecords.loadedRubric = [];
    docEl("ac_ru_del").style.display = "none";
    hideEl("ruCreateNew");
    hideEl("ruLoadSelected");
    hideEl("ruLoadChkBoxes");
    showEl("ruNewRubricName");
    newRubrikHandlersOn();
}
function initNewRubrik() {
    var named = docEl("ruEnterNewName").value;

    if (named === "") {
        displayMsg("h");
        return;
    }
    appEditor.editorIsOpen.rubric = true;
    docEl("ruNameNewtxt").value = named;
    showEl("ruNameCurrent");
    showEl("sectionInputWrapper");
    showEl("rubricActions");
    newRubrikHandlersOffAndExit();
}
function coldExitNewRubrik() {
    appEditor.editorIsOpen.rubric = false;
    docEl("ruEnterNewName").value = "";
    showEl("ruCreateNew");
    hideEl("ruLoadSelected");
    showEl("ruLoadChkBoxes");
    newRubrikHandlersOffAndExit();

    if (appEditor.rubricsIndex.length) { showEl("ruLoadSelected"); }
}
function createNewSectionTable(tableId) {
    if (!appEditor.tableObj.hasOwnProperty(tableId)) { // when NOT loading an existing rubrik
        appEditor.tableObj[tableId] = [["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""]];
    }
    appEditor.table_Id = "" + tableId;

    var container = docEl("rubrik");
    var frag = document.createDocumentFragment();
    var newTable = document.createElement("table");
    var newThead = document.createElement("thead");
    var newTbody = document.createElement("tbody");
    var newDiv1 = document.createElement("div");
    var newDiv2 = document.createElement("div");
    var newDiv3 = document.createElement("div");
    var newInput1 = document.createElement("input");
    var newBtn1 = document.createElement("button");
    var newBtn2 = document.createElement("button");

    newDiv3.id = "hn" + tableId;
    newDiv3.className = "sectionNameEdit nodisplay";
    newInput1.id = "ht" + tableId;
    newInput1.dataset.oldval = "";
    newBtn1.id = "hk-" + tableId;
    newBtn1.className = "btn btn-sm btn-whiteBlue";
    newBtn1.textContent = "Rename section";
    newBtn2.id = "hz-" + tableId;
    newBtn2.className = "btn btn-sm btn-default";
    newBtn2.textContent = "Cancel";
    newTable.className = "spreadsheet__table";
    newThead.id = "table-headers-" + tableId;
    newThead.className = "spreadsheet__table--headers";
    newTbody.className = "spreadsheet__table--body";
    newTbody.id = "table-body-" + tableId;
    newDiv1.id = "hs-" + tableId;
    newDiv1.className = "btn btn-xs btn-blueYellow pull-right spreadSheetBtn";
    newDiv1.textContent = "Reset section";
    newDiv2.id = "hd-" + tableId;
    newDiv2.className = "btn btn-xs btn-dangerous pull-right spreadSheetBtn";
    newDiv2.textContent = "Delete section";

    newDiv3.appendChild(newInput1);
    newDiv3.appendChild(newBtn1);
    newDiv3.appendChild(newBtn2);
    newTable.appendChild(newThead);
    newTable.appendChild(newTbody);
    frag.appendChild(newDiv3);
    frag.appendChild(newTable);
    frag.appendChild(newDiv2);
    frag.appendChild(newDiv1);
    container.appendChild(frag);
}
function initializeData() {
    var defaultRowCount = 5; //init num of blank rows
    var defaultColCount = 6; //init num of blank cols
    var data = [];
    var child;

    for (var i = 0; i <= defaultRowCount; i++) {
        child = [];
        for (var j = 0; j <= defaultColCount; j++) {
            child.push("");
        }
        data.push(child);
    }
    return data;
}
function getData() {
    var data = appEditor.tableObj[appEditor.table_Id];

    if (data === undefined || data === null) { return initializeData(); }
    return data;
}
function saveData(data) {
    appEditor.tableObj[appEditor.table_Id] = data;
}
function resetData(tableId, bool) {
    appEditor.tableObj[tableId] = initializeData();
    createSpreadsheet(bool);
}
function createHeaderRow(defaultColCount) {
    var tr = document.createElement("tr");
    var i;

    tr.setAttribute("id", "hh-0-" + appEditor.table_Id);
    for (i = 0; i <= defaultColCount; i++) {
        var th = document.createElement("th");
        th.setAttribute("id", "hb-0-" + i + "-" + appEditor.table_Id);
        th.setAttribute("class", '' + (i === 0 ? "" : "column-header"));
        if (i !== 0) {
            var span = document.createElement("span");

            if (i > 1) {
                span.setAttribute("class", "column-header-span");

                var dropDownDiv = document.createElement("div");
                var newBtn = document.createElement("button");
                var newDiv = document.createElement("div");
                var newP1 = document.createElement("p");
                var newP2 = document.createElement("p");
                var newP3 = document.createElement("p");

                dropDownDiv.setAttribute("class", "dropdown");
                newBtn.id = "hx-dropbtn-" + i + "-" + appEditor.table_Id + "";
                newBtn.className = "dropbtn";
                newDiv.id = "hx-dropdown-" + i + "-" + appEditor.table_Id + "";
                newDiv.className = "dropdown-content";
                newP1.className = "col-insert-left";
                newP1.textContent = "Insert column left";
                newP2.className = "col-insert-right";
                newP2.textContent = "Insert column right";
                newP3.className = "col-delete";
                newP3.textContent = "Delete column";

                newDiv.appendChild(newP1);
                newDiv.appendChild(newP2);
                newDiv.appendChild(newP3);
                dropDownDiv.appendChild(newBtn);
                dropDownDiv.appendChild(newDiv);
                th.appendChild(span);
                th.appendChild(dropDownDiv);
            }
        }
        tr.appendChild(th);
    }
    return tr;
}
function createTableBodyRow(rowNum, defaultColCount) {
    var tr = document.createElement("tr");
    tr.setAttribute("id", 'hr-' + rowNum + "-" + appEditor.table_Id);

    for (var i = 0; i <= defaultColCount; i++) {
        var cell = document.createElement('td');

        if (i === 0) {
            cell.contentEditable = false;

            if (rowNum > 1) {
                var span = document.createElement("span");
                var dropDownDiv = document.createElement("div");
                var newBtn = document.createElement("button");
                var newDiv = document.createElement("div");
                var newP1 = document.createElement("p");
                var newP2 = document.createElement("p");
                var newP3 = document.createElement("p");

                dropDownDiv.setAttribute("class", "dropdown");
                newBtn.id = "hy-dropbtn-" + rowNum + "-" + appEditor.table_Id + "";
                newBtn.className = "dropbtn";
                newDiv.id = "hy-dropdown-" + rowNum + "-" + appEditor.table_Id + "";
                newDiv.className = "dropdown-content";
                newP1.className = "row-insert-top";
                newP1.textContent = "Insert row above";
                newP2.className = "row-insert-bottom";
                newP2.textContent = "Insert row below";
                newP3.className = "row-delete";
                newP3.textContent = "Delete row";

                newDiv.appendChild(newP1);
                newDiv.appendChild(newP2);
                newDiv.appendChild(newP3);
                dropDownDiv.appendChild(newBtn);
                dropDownDiv.appendChild(newDiv);
                cell.appendChild(span);
                cell.appendChild(dropDownDiv);
            }
            cell.setAttribute("class", "row-header");
        } else if (i === 1 && rowNum === 1) {
            cell.contentEditable = false;
            cell.setAttribute("class", "criterias");
        } else {
            cell.contentEditable = true;
        }
        cell.setAttribute("id", 'hr-' + rowNum + '-' + i + "-" + appEditor.table_Id);
        tr.appendChild(cell);
    }
    return tr;
}
function createTableBody(tableBody, defaultRowCount, defaultColCount) {
    var rowNum;

    for (rowNum = 1; rowNum <= defaultRowCount; rowNum++) {
        tableBody.appendChild(createTableBodyRow(rowNum, defaultColCount));
    }
}
function populateTable() {
    var data = getData();
    var cell,
        i,
        j;

    if (data === undefined || data === null) { return; }

    for (i = 1; i < data.length; i++) {
        for (j = 1; j < data[i].length; j++) {
            cell = docEl('hr-' + i + '-' + j + '-' + appEditor.table_Id);
            cell.textContent = data[i][j];
        }
    }
}
function addRow(currentRow, direction) {
    var data = getData();
    var colCount = data[0].length;
    var newRow = new Array(colCount).fill("");

    if (direction === "top") { data.splice(currentRow, 0, newRow); }
    if (direction === "bottom") { data.splice(currentRow + 1, 0, newRow); }

    saveData(data);
    createSpreadsheet(false);
}
function addColumn(currentCol, direction) {
    var data = getData();
    var rowCount = data.length;
    var i;

    for (i = 0; i < rowCount; i++) {
        if (direction === "left") { data[i].splice(currentCol, 0, ""); }
        if (direction === "right") { data[i].splice(currentCol + 1, 0, ""); }
    }
    saveData(data);
    createSpreadsheet(false);
}
function deleteRow(currentRow) {
    var data = getData();

    if (data.length <= 3) { return false; } //prevent removal of last existing criteria row

    data.splice(currentRow, 1);
    saveData(data);
    createSpreadsheet(false);
}
function deleteColumn(currentCol) {
    var data = getData();
    var rowCount = data.length;
    var colCount = data[0].length;
    var i;

    if (colCount <= 3) { return false; } //prevent removal of last existing score column

    for (i = 0; i < rowCount; i++) {
        data[i].splice(currentCol, 1);
    }
    saveData(data);
    createSpreadsheet(false);
}
function tableFocus(e) {
    var item,
        indices,
        spreadsheetData;

    if (e.target !== e.currentTarget) {
        if (e.target && e.target.nodeName === "TD") {
            item = e.target.id;
            indices = item.split("-");
            appEditor.table_Id = "" + indices[3];
            spreadsheetData = getData();
            spreadsheetData[indices[1]][indices[2]] = fixNewlinesInContentEditable(item);
            saveData(spreadsheetData);
        }
        e.stopPropagation();
    }
}
function rowName(e) {
    var idxArr = e.target.id.split("-");

    if (idxArr[0] === "hr" && idxArr[1] === "1" && idxArr[2] === "1") {
        appEditor.table_Id = "" + idxArr[3];
        renameSection(idxArr[3]);
    }
}
function rowDown(e) {
    var idxArr = e.target.id.split("-");

    appEditor.table_Id = "" + idxArr[3];
    docEl('hy-dropdown-' + idxArr[2] + "-" + appEditor.table_Id).classList.toggle("show");
}
function rowTop(e) {
    var idxArr = e.target.parentNode.id.split("-");

    appEditor.table_Id = "" + idxArr[3];
    addRow(parseInt(idxArr[2]), "top");
}
function rowBtm(e) {
    var idxArr = e.target.parentNode.id.split("-");

    appEditor.table_Id = "" + idxArr[3];
    addRow(parseInt(idxArr[2]), "bottom");
}
function rowDel(e) {
    var idxArr = e.target.parentNode.id.split("-");

    appEditor.table_Id = "" + idxArr[3];
    deleteRow(parseInt(idxArr[2]));
}
function colDown(e) {
    var idx = e.target.id.split("-");

    appEditor.table_Id = "" + idx[3];
    docEl('hx-dropdown-' + idx[2] + "-" + appEditor.table_Id).classList.toggle("show");
}
function colLeft(e) {
    var idx = e.target.parentNode.id.split("-");

    appEditor.table_Id = "" + idx[3];
    addColumn(parseInt(idx[2]), "left");
}
function colRight(e) {
    var idx = e.target.parentNode.id.split("-");

    appEditor.table_Id = "" + idx[3];
    addColumn(parseInt(idx[2]), "right");
}
function colDel(e) {
    var idx = e.target.parentNode.id.split("-");

    appEditor.table_Id = "" + idx[3];
    deleteColumn(parseInt(idx[2]));
}
function renameSection(tableId) {
    docEl("ht" + tableId).value = appEditor.table_lookup[tableId];
    docEl("ht" + tableId).setAttribute("data-oldval", appEditor.table_lookup[tableId]);
    showEl("hn" + tableId);
}
function chkDupOnChange(newName, currentName) {
    var isDup = dupSectionName(newName);

    if (isDup === true) {
        if (newName === currentName) { isDup = false; }
    }
    return isDup;
}
function applySectionNameChange(tableId) {
    var elId = "ht" + tableId;
    var currentName = docEl(elId).dataset.oldval;
    var objKey = getKeyGivenValue(appEditor.table_lookup, currentName);
    var newName = docEl(elId).value;
    var isDup = chkDupOnChange(newName, currentName);

    if (isDup === true) {
        docEl(elId).value = "";
        displayMsg("g");
        return;
    }
    appEditor.table_lookup[objKey] = newName;
    appEditor.table_Id = "" + newName;
    docEl(elId).dataset.oldval = "";
    docEl("hr-1-1-" + objKey).textContent = newName;
    renameSectionExit(tableId);
}
function renameSectionExit(tableId) {
    hideEl("hn" + tableId);
    docEl("ht" + tableId).value = "";
}
function resetRenameOk(indices) {
    appEditor.table_Id = "" + indices[1];
    applySectionNameChange(indices[1]);
}
function resetRenameExit(indices) {
    appEditor.table_Id = "" + indices[1];
    renameSectionExit(indices[1]);
}
function resetReset(indices) {
    appEditor.table_Id = "" + indices[1];
    window.mscConfirm({
        title: '',
        subtitle: 'This will reset all data in this section! Are you sure?',
        cancelText: 'Exit',
        onOk: function () {
            resetData(appEditor.table_Id, false);
        },
        onCancel: function () {
            return;
        }
    });
}
function resetDelete(indices) {
    appEditor.table_Id = "" + indices[1];
    window.mscConfirm({
        title: '',
        subtitle: 'This will delete all data in this section! Are you sure?',
        cancelText: 'Exit',
        onOk: function () {
            deleteSection(indices[1]);
        },
        onCancel: function () {
            return;
        }
    });
}
function closeDropBtn(e) { //Close the dropdown menu if the user clicks outside of it #editRubric
    var dropdowns,
        openDropdown,
        i;

    if (!e.target.matches(".dropbtn")) {
        dropdowns = document.getElementsByClassName("dropdown-content");

        for (i = 0; i < dropdowns.length; i++) {
            openDropdown = dropdowns[i];

            if (openDropdown.classList.contains("show")) { openDropdown.classList.remove("show"); }
        }
    }
}
function dupSectionName(val) {
    var allKeys = Object.keys(appEditor.tableObj);
    var returnVal = false;
    var i;

    if (allKeys.length) {
        for (i = 0; i < allKeys.length; i++) {
            if (appEditor.table_lookup[allKeys[i]] === val) {
                returnVal = true;
                break;
            }
        }
    }
    return returnVal;
}
function initNewSectionFromNew() {
    var val = docEl("newRubrikSection").value;
    var bool = dupSectionName(val);
    var lookupKeys = Object.keys(appEditor.table_lookup);
    var lastIndex,
        newIndex;

    if (lookupKeys.length > 0) {
        lastIndex = lookupKeys.length - 1;
        lookupKeys = lookupKeys.sort();
        newIndex = "table" + (Number((lookupKeys[lastIndex]).substring(5)) + 1);
    } else {
        newIndex = "table0";
    }
    appEditor.table_lookup[newIndex] = val;
    initNewSection(val, bool);
}
function initNewSectionFromLoad(sectionId) {
    initNewSection(sectionId, false);
}
function convertToRubricObj(rubrikName) {
    var keys = Object.keys(appEditor.tableObj);
    var newRubrik = {};
    var newSection;
    var newCriteria;
    var newDef;
    var i,
        ii,
        iii;
    let criteriaSort;

    newRubrik.rubricName = rubrikName;
    newRubrik.rubricDef = [];

    for (i = appEditor.appEditRecords.loadedRubric.length - 1; i >= 0; i--) {
        if (appEditor.appEditRecords.loadedRubric[i].rubricName === rubrikName) {
            appEditor.appEditRecords.loadedRubric.splice(i, 1);
        }
    }
    for (i = 0; i < keys.length; i++) {
        newSection = {};
        newSection.sectionName = appEditor.table_lookup[keys[i]]; //newSection.sectionName = keys[i];
        newSection.sectionDef = [];

        for (ii = 2; ii < appEditor.tableObj[keys[i]].length; ii++) {
            newCriteria = {};
            newCriteria.criteriaName = appEditor.tableObj[keys[i]][ii][1];
            newCriteria.criteriaDef = [];

            for (iii = 2; iii < appEditor.tableObj[keys[i]][ii].length; iii++) {
                newDef = {};
                newDef.score = appEditor.tableObj[keys[i]][1][iii];
                newDef.descriptor = appEditor.tableObj[keys[i]][ii][iii];
                newCriteria.criteriaDef.push(newDef);
            }
            criteriaSort = newCriteria.criteriaDef; 
            newCriteria.criteriaDef = criteriaSort.sort(function (a,b) {
                return Number(a.score) - Number(b.score);
            });
            newSection.sectionDef.push(newCriteria);
        } 
        newRubrik.rubricDef.push(newSection);
    }
    return newRubrik;
}
function allChksPassForNewRubrik() {
    var returnVal = "true";
    var tblObj = appEditor.tableObj;
    var sectionKeys = Object.keys(tblObj);
    var eachSection,
        uniqLenChk,
        dupsArr,
        i,
        ii,
        iii;

    if (docEl("ruNameNewtxt").value === "") { return "Please give the rubric a name!"; }
    if (!sectionKeys.length) { return "Please add at least one section!"; }

    for (i = 0; i < sectionKeys.length; i++) {
        if (sectionKeys[i] === "") {
            returnVal = "Please provide names for all sections!";
            break;
        }
        eachSection = sectionKeys[i];

        if (tblObj[eachSection].length < 3) {
            returnVal = "Please provide at least one criteria!";
            break;
        }

        for (ii = 2; ii < tblObj[eachSection].length; ii++) {
            if (tblObj[sectionKeys[i]][ii].length < 3) {
                returnVal = "Please provide at least one score!";
                break;
            }
            if (tblObj[sectionKeys[i]][ii][1] === "") {
                returnVal = "Please provide names for all criterias!";
                break;
            }

            for (iii = 2; iii < tblObj[eachSection][ii].length; iii++) {
                if (tblObj[eachSection][1][iii] === "" || Number.isNaN(tblObj[eachSection][1][iii])) { //!!isNaN(tblObj[eachSection][1][iii])) {
                    returnVal = "All scores are required and must be numerical!";
                    break;
                }
            }
            dupsArr = uniqueValues(tblObj[eachSection][1]);
            uniqLenChk = tblObj[eachSection][1].length - dupsArr.length; //...+1 difference because the first two elements === ""

            if (uniqLenChk !== 1) {
                returnVal = "Please ensure that the scores within each section are unique (no duplicate scores)!";
                break;
            }
        }
    }
    return returnVal;
}
function exitEditRubrics() {
    var sectionKeys = Object.keys(appEditor.tableObj);
    var i;

    for (i = 0; i < sectionKeys.length; i++) {
        removeOldListeners(sectionKeys[i]);
    }
    emptyContent(docEl("rubrik"));
    appEditor.tableObj = {};
    appEditor.table_Id = "";
    appEditor.table_lookup = {};
    appEditor.editorIsOpen.rubric = false;
    hideEl("ruNameCurrent");
    docEl("ruNameNewtxt").value = "";
    docEl("ruEnterNewName").value = "";
    hideEl("ruNewRubricName");
    hideEl("sectionInputWrapper");
    hideEl("rubricActions");
    docEl("ac_ru_del").style.display = "none";

    if (appEditor.rubricsIndex.length) { showEl("ruLoadSelected"); }

    showEl("ruCreateNew");
    showEl("ruLoadChkBoxes");
}
function discardRubrik() {
    if (appEditor.appEditRecords.loadedRubric.length) { showEl("ruLoadSelected"); }
    exitEditRubrics();
}
function convertFromRubrikObj() {
    var selectedRubik = appEditor.appEditRecords.loadedRubric[0];
    var allSectionNames = [];
    var nestedArr,
        defaultRowCount,
        defaultColCount,
        newTableLookup,
        i,
        ii,
        iii;

    for (i = 0; i < selectedRubik.rubricDef.length; i++) {
        allSectionNames.push(selectedRubik.rubricDef[i].sectionName);
    }
    allSectionNames = fixLoadedRubrikDupSections(allSectionNames); //any dup name issues must be resolved FIRST!

    for (i = 0; i < selectedRubik.rubricDef.length; i++) {
        selectedRubik.rubricDef[i].sectionName = allSectionNames[i];
    }
    appEditor.tableObj = {};

    for (i = 0; i < selectedRubik.rubricDef.length; i++) { //defaultRowCount and defaultColCount can be different for each section...
        defaultRowCount = selectedRubik.rubricDef[i].sectionDef.length + 2;
        defaultColCount = selectedRubik.rubricDef[i].sectionDef[0].criteriaDef.length + 2;
        newTableLookup = "table" + i;
        appEditor.tableObj[newTableLookup] = [];
        appEditor.table_lookup[newTableLookup] = selectedRubik.rubricDef[i].sectionName;

        for (ii = 0; ii < defaultRowCount; ii++) {
            nestedArr = new Array(defaultColCount).fill("");
            appEditor.tableObj[newTableLookup].push(nestedArr);
        }
    }

    for (i = 0; i < selectedRubik.rubricDef.length; i++) {
        newTableLookup = getKeyGivenValue(appEditor.table_lookup, selectedRubik.rubricDef[i].sectionName);
        defaultRowCount = selectedRubik.rubricDef[i].sectionDef.length + 2;
        defaultColCount = selectedRubik.rubricDef[i].sectionDef[0].criteriaDef.length + 2;

        for (ii = 2; ii < defaultRowCount; ii++) {
            appEditor.tableObj[newTableLookup][ii][1] = selectedRubik.rubricDef[i].sectionDef[ii - 2].criteriaName;

            for (iii = 2; iii < defaultColCount; iii++) {
                appEditor.tableObj[newTableLookup][1][iii] = selectedRubik.rubricDef[i].sectionDef[ii - 2].criteriaDef[iii - 2].score;
                appEditor.tableObj[newTableLookup][ii][iii] = selectedRubik.rubricDef[i].sectionDef[ii - 2].criteriaDef[iii - 2].descriptor;
            }
        }
    }
    return allSectionNames;
}
function displayAvailableRubriks(available) {
    var i;

    emptyContent(docEl("ruLoadChkBoxes"));

    if (available.length) {
        for (i = 0; i < available.length; i++) {
            createAvailableRubriksButtons(available[i], true);
        }
    }
    showEl("ruLoadSelected");
}
function loadRubriks() { //init
    docEl("shareThisRubric").checked = false;
    displayAvailableRubriks(Object.keys(appEditor.rubricsIndex));
}
function getDupsFromArr(arr) {
    var duplicates = {};
    var i;

    for (i = 0; i < arr.length; i++) {
        if (duplicates.hasOwnProperty(arr[i])) {
            duplicates[arr[i]].push(i);
        } else if (arr.lastIndexOf(arr[i]) !== i) {
            duplicates[arr[i]] = [i];
        }
    }
    return duplicates;
}
function fixLoadedRubrikDupSections(allSectionNames) {
    var dupsObj = getDupsFromArr(allSectionNames);
    var dupKeys = Object.keys(dupsObj);
    var dupIndexes,
        i,
        ii;

    for (i = 0; i < dupKeys.length; i++) {
        dupIndexes = dupsObj[dupKeys[i]];

        for (ii = 0; ii < dupIndexes.length; ii++) {
            if (ii > 0) { allSectionNames[dupIndexes[ii]] = allSectionNames[dupIndexes[ii]] + "(" + ii + ")"; }
        }
    }
    return allSectionNames;
}
function selectLoadedRubrik() {
    var allRubrikBtns = document.getElementsByName('scalor');
    var rubricNameKey,
        i;

    for (i = 0; i < allRubrikBtns.length; i++) {
        if (allRubrikBtns[i].checked) {
            rubricNameKey = allRubrikBtns[i].value;
            break;
        }
    }
    getSelectedRubrik(rubricNameKey);
}
function showLoadedRubrik() {
    var rubrikKeys = [];
    var i;

    showEl("ruNameCurrent");
    docEl("ruNameNewtxt").value = appEditor.appEditRecords.loadedRubric[0].rubricName;
    docEl("shareThisRubric").checked = false;
    rubrikKeys = convertFromRubrikObj(); //returns the correct order of sections from appEditor.appEditRecords.loadedRubric...

    for (i = 0; i < rubrikKeys.length; i++) {
        appEditor.table_Id = "" + rubrikKeys[i];
        initNewSectionFromLoad(rubrikKeys[i]);
    }
    appEditor.editorIsOpen.rubric = true;
    hideEl("ruLoadChkBoxes");
    hideEl("ruLoadSelected");
    hideEl("ruCreateNew");
    showEl("sectionInputWrapper");
    showEl("rubricActions");
    docEl("ac_ru_del").style.display = "block";
}
function rubricCommitted(key, idxObj) {
    appEditor.rubricsIndex[key] = idxObj;
    appEditor.appEditRecords.loadedRubric = [];
    updateSnippetRubricTags();
    loadRubriks();
    exitEditRubrics();
    enableEl("editRubric");
    displayMsg("e");
}
function idxObjFromRubricPostData(postData) {
    var newRubricIndexObj = { "rubricName": postData.rubricName, "sectionNames": [] };

    newRubricIndexObj.sectionNames = postData.rubricDef.map(function (el) { return el.sectionName; }); //get all sectionNames from postData
    return newRubricIndexObj;
}
function rubrikDestroyed(key) {
    delete appEditor.rubricsIndex[key];
    appEditor.appEditRecords.loadedRubric = [];
    hideEl("ruLoadSelected");
    exitEditRubrics();
    loadRubriks();
    updateSnippetRubricTags();
}
function destroyRubrik() {
    const loadedRubric = appEditor.appEditRecords.loadedRubric[0];

    window.mscConfirm({
        title: 'Warning!',
        subtitle: 'You are about to delete rubric: ' + loadedRubric.rubricName + '\nAre you sure?',
        cancelText: 'Exit',
        onOk: function () {
            removeRubrikFromDb(loadedRubric.rubricKey);
        },
        onCancel: function () {
            return;
        }
    });
}

