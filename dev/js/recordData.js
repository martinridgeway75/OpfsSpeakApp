
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

function getRecordsIndexFromDb() {
    readOnlyDb({ fileName: "recordsIdx" }).then( (data) => { //expect [] || undefined
        hasFetchedRecordsIdx(data);
    });
}

//@records
function getSingleRecordForDownload(keyArr, elId){
    readOnlyDb({ subDir: { path: "records", fileUidsArr: keyArr } }).then( (data) => { //expect [] || undefined
        hasFetchedSingleRecord(data[0], key, elId);
    });
}
function getSelectedRecordsForDownload(keyArr, elId) {
    readOnlyDb({ subDir: { path: "records", fileUidsArr: keyArr } }).then( (dataArr) => { //expect [] || undefined
        hasFetchedRecords(dataArr, keyArr, elId);
    });
}
function deleteRecordsViaMap(keyArr) {
    updateDeletionOfRecordsInAppEditor(keyArr);
    displayMsg("o");
    buildRecordsMap();
    writeToDb({ obj: appEditor.recordsIndex, fileName: "recordsIdx", subDir: { path: "records", fileUidsArr: keyArr }}, "delete", hasRemovedRecords);  //expect [Uuid] || []
}
function saveUpdatedRecords() {//records for the current temp student are being updated
    const tempRecordArr = appEditor.appEditRecords.tempStudentRecords;
    let keyArr = [];
    let postDataArr = [];
    let idx;

    if (!tempRecordArr.length) { return; }

    tempRecordArr.forEach( function (obj) {
        if (!obj?.null_marked_for_deletion) {
            keyArr.push(obj.recordKey);
            obj = removeRecordKeyFromObjForDb(obj);
            postDataArr.push(obj);

            idx = appEditor.recordsIndex.map(function (el) { return el.recordKey; }).indexOf(obj.recordKey);
            appEditor.recordsIndex[idx] = createIndexObjForDb(obj); //TODO: not sure why this is here
        }
    });
    saveUpdateRecordsInAppEditor();
    displayMsg("r");
    buildRecordsMap(); //changes will be reflected onreload here
    exitUpdateRecords();
    writeToDb({ obj: appEditor.recordsIndex, fileName: "recordsIdx", subDir: { path: "records", obj: postDataArr, fileUidsArr: keyArr }}, "write", hasSetNewRecords); //expect <String> e || "OK"
}


function pushNewRecordToDb(dataObj) { //dataObj is but one record

// what is this? :  postData; ??

    if (!appEditor.db.records) { return; }

    const newPostKey = crypto.randomUUID();

    addNewRecordToRecordsIndex(newPostKey, postData);
    writeToDb({ obj: appEditor.recordsIndex, fileName: "recordsIdx", subDir: { path: "records", obj: dataObj, fileUid: newPostKey }}, "write", hasSetNewRecord); //expect <String> e || "OK"

    //success callback
    displayMsg("s");
    resetDataEntry();

    //error callback
    displayMsg("a", error);
}





function dlNewRecordAndSave() { //on a click handler
    newRecordSaveThenDl(true);
}
function commitNewRecord() { //on a click handler
    newRecordSaveThenDl(false);
}

function newRecordSaveThenDl(bool) {
    const allready = saveTempRecord();

    if (!allready) { return; }
    if (bool) { dlNewRecord(); }

    const dataObj = createFinalRecord();
    pushNewRecordToDb(dataObj);    
}


























function addNewRecordToRecordsIndex(newPostKey, postData) {
    var newObj = {
        stCls: "" + postData.studentData.stCls,
        stId: "" + postData.studentData.stId,
        stNme: "" + postData.studentData.stNme,
        context: "" + postData.context,
        recordKey: "" + newPostKey,
        timeStamp: [postData.timeStamp].slice(0)[0]
    };
    appEditor.recordsIndex.push(newObj); //appEditor.recordsIndex is not sorted
    buildRecordsMap();
}


/*********callbacks***********/

function hasFetchedRecordsIdx(data) {
    const flatRec = flattenRecords(data);

    if (flatRec === false) { //false would be null
        appEditor.recordsIndex = [];
    }
    displayRecords();

    if (!appEditor.db.records) {
        recordsHandlersOn();
        appEditor.db.records = true;
    }
}
function hasFetchedSingleRecord(data, key, elId) {
    if (data == undefined) { return; }

    data.recordKey = key; //add recordKey tot he obj
    dlSingleRecord(data, elId);
}
function hasFetchedRecords(dataArr, keyArr, elId) {
    if (dataArr == undefined || !dataArr.length) { return; }

    const len = keyArr.length;
    let pdfObjArr = [];
    let pdfObj;
    let recordObj;

    keyArr.forEach( function(key, i) {
        recordObj = dataArr[i];
        recordObj.recordKey = key; //add recordKey to the obj
        pdfObj = {};
        pdfObj.content = buildPDFrecord(recordObj);
        pdfObj.name = '' + recordObj.studentData.stCls + '_' + recordObj.studentData.stNme + '_' + recordObj.studentData.stId + '_' + recordObj.context+ '_' + recordObj.timeStamp + '.pdf';
        pdfObjArr.push(pdfObj);

        if (pdfObjArr.length === len) {
            addToZip(pdfObjArr, elId);
        }
    });
}
function hasRemovedRecords(msg) {
    if (msg === "OK") { return; }
    
    displayMsg("n", msg);
}
function hasSetNewRecord(msg) {
    if (msg === "OK") { return; }
    
    displayMsg("a", msg);
}

/*********************/

function buildTempRecords() { //referring to the student loaded into: appEditor.appEditRecords.tempStudent...
    const uid = auth.currentUser.uid;
    const tmpStdntRec = appEditor.appEditRecords.tempStudent;
    let count = 0;
    let recordsExist;
    let len;
    let elsChkd;
    let path;

    if (tmpStdntRec.stId == "") { return; }
    if (tmpStdntRec.stNme == "") { return; }
    if (tmpStdntRec.Clss == "") { return; }

    recordsExist = getOneSetOfRecords(tmpStdntRec.stId, tmpStdntRec.stNme, tmpStdntRec.Clss);

    if (!recordsExist.length) {
        docEl("recordsContainer").textContent = "No records exist for this student!";
        hideEl("ac_re_update");
        hideEl("ac_re_exit");
        buildRecordsMap();
        return;
    }
    appEditor.appEditRecords.tempStudentRecords = []; //must be kept clear
    elsChkd = recordsExist.filter(function (el) {
        return docEl("jk" + el.recordKey).checked === true;
    });
    len = elsChkd.length;

    if (len === 0) { noRecordsSelected(); return; }

    elsChkd.forEach(function (el) {
        path = "" + /*appEditor.settings.dbCtx*/ + "/" + uid + "/records/" + el.recordKey;

        onValue(ref(db, path), (snapshot) => {
            const fullRecord = snapshot.val();

            if (fullRecord !== null) {
                fullRecord.recordKey = el.recordKey; //add recordKey here so we can update changes by key directly
                appEditor.appEditRecords.tempStudentRecords.push(fullRecord);
            }
            count++;

            if (count === len) {
                loadSelectedStudentRecords();
            }
        }, (error) => {
            chkPermission(error);
        }, {
            onlyOnce: true
        });
    });
}

//DOWNLOADING RECORDS

function getTextAsImageURI(txt) {
    var canvas = docEl("txtCanvas");
    var ctx = canvas.getContext("2d");

    ctx.font = "30px Arial";
    ctx.fillText(txt, 0, 30); //start at x,y = 0,30

    return canvas.toDataURL("image/png");
}
function clearTxtCanvas() {
    var canvas = docEl('txtCanvas');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function updateDeletionOfRecordsInAppEditor(checkedRecords) {
    var idx;

    checkedRecords.forEach(function (recordKey) {
        idx = appEditor.recordsIndex.map(function (el) { return el.recordKey; }).indexOf(recordKey);

        if (idx !== -1) { //chk which records are null and splice them...
            appEditor.recordsIndex.splice(idx, 1);
        }
    });
}
function getAllChkdForDelete(elId) { //called on "delete record" button FROM MAP
    var tbl = "jb" + elId.substring(2);
    var allInputs = docEl(tbl).querySelectorAll("input.targeted");
    var checkedRecords = [];

    allInputs.forEach(function (el) {
        if (el.checked === true) {
            checkedRecords.push((el.id).substring(2));
        }
    });
    if (!checkedRecords.length) { return; }

    window.mscConfirm({
        title: '',
        subtitle: 'This will permanently delete the selected records from this class! Are you sure?',
        cancelText: 'Exit',
        onOk: function () {
            deleteRecordsViaMap(checkedRecords);
        },
        onCancel: function () {
            return;
        }
    });
}
function getAllChkdForDl(elId) { //called on "download" button
    var tbl = "jb" + elId.substring(2);
    var allInputs = docEl(tbl).querySelectorAll("input.targeted");
    var checkedRecords = [];

    allInputs.forEach(function (el) {
        if (el.checked === true) {
            checkedRecords.push((el.id).substring(2));
        }
    });
    if (!checkedRecords.length) { return; }

    docEl(elId).className += " invisible";

    if (checkedRecords.length === 1) {
        getSingleRecordForDownload(checkedRecords, elId);
        return;
    }
    getSelectedRecordsForDownload(checkedRecords, elId);
}

//NEW RECORDS IN GRADER

function saveTempRecord() {
    var allLocked = allSectionsAreLocked();

    if (appEditor.grader.tempRecord.ssId === "" || appEditor.grader.tempRecord.ssName === "") {
        displayMsg("t");
        return false;
    }
    if (appEditor.grader.noRubricCommentsOnly === true) {
        if (getGenScoreForNoRubric("gOvrllScr", "gOvrllMax")[0] === "error") { return false; }
    }
    if (allLocked === true) {
        setTempFeedbackComment();
        hideEl("gradeActions");
        return true;
    }
    return false;
}
function allValuesSet(sectionIndex) {
    var complete = true;
    var i;

    for ( i = 0; i < appEditor.grader.tempRecord.scores[sectionIndex].length; i++ ) {
        if(!appEditor.grader.tempRecord.scores[sectionIndex][i].length) {
            complete = false;
            break;
        }
    }
    return complete;
}
function findMaxScore(arrRef) { //find the highest score at any position in the rubric (L to R / R to L, or randomly ordered) -> gives criterias equal weighting within a section
    var highScoreArr = arrRef.map(function(el){ return el.score; }).sort(function(a, b){ return a - b; });
    var highScore = highScoreArr[highScoreArr.length - 1];

    return highScore;
}
function getTempRecordVariables(i, ii) { //required for: making final record for save, viewing rubric preview, pdf
    var criteriaIndex = appEditor.grader.tempRecord.scores[i][ii][1];
    var descIndex = appEditor.grader.tempRecord.scores[i][ii][2];
    var currentValues = {};

    currentValues.sectionIndex = appEditor.grader.tempRecord.scores[i][ii][0];
    currentValues.sectionName = appEditor.grader.rubric[currentValues.sectionIndex].sectionName;
    currentValues.criteria = appEditor.grader.rubric[currentValues.sectionIndex].sectionDef[criteriaIndex].criteriaName;
    currentValues.score = appEditor.grader.rubric[currentValues.sectionIndex].sectionDef[criteriaIndex].criteriaDef[descIndex].score;
    currentValues.maxScore = findMaxScore(appEditor.grader.rubric[currentValues.sectionIndex].sectionDef[criteriaIndex].criteriaDef);
    currentValues.descriptor = appEditor.grader.rubric[currentValues.sectionIndex].sectionDef[criteriaIndex].criteriaDef[descIndex].descriptor;
    return currentValues;
}
function lockThisSection(elId, sectionIndex) {
    setTempRecordComment(elId);
    hideEl("gq" + sectionIndex);
    displayLockedText(sectionIndex, true);
    appEditor.grader.tempRecord.sectionLocked[sectionIndex] = true;
    lockIcon(elId, true);
}
function unlockThisSection(elId, sectionIndex) {
    displayLockedText(sectionIndex, false);
    showEl("gq" + sectionIndex);
    appEditor.grader.tempRecord.sectionLocked[sectionIndex] = false;
    lockIcon(elId, false);
}
function sectionlock(elId) {
    var sectionIndex = Number(elId.substring(2));
    var canLock = allValuesSet(sectionIndex);
    var allSet = false;

    if (appEditor.grader.tempRecord.sectionLocked[sectionIndex] === false) {
        if (canLock === false) {
            displayMsg("u");
        } else {
            lockThisSection(elId, sectionIndex);
            allSet = allSectionsAreLocked();
        }
    } else if (appEditor.grader.tempRecord.sectionLocked[sectionIndex] === true) {
        unlockThisSection(elId, sectionIndex);
    }
    showOrHideSaveBtn(allSet);
}
function allSectionsAreLocked() {
    var allLocked = true;
    var i;

    for ( i = 0; i < appEditor.grader.tempRecord.sectionLocked.length; i++) {
        if (appEditor.grader.tempRecord.sectionLocked[i] === false) {
            allLocked = false;
        }
    }
    return allLocked;
}
function setTempRecordComment(elId) {
    var sectionIndex = Number(elId.substring(2));
    //var comment = docEl("gk" + sectionIndex).textContent;
    var comment = fixNewlinesInContentEditable("gk" + sectionIndex);

    appEditor.grader.tempRecord.comments[sectionIndex] = comment;
}
function setTempFeedbackComment() {
    //var fbComment = docEl("gFbWritten").textContent;
    var fbComment = fixNewlinesInContentEditable("gFbWritten");

    appEditor.grader.tempRecord.feedback.written = fbComment;
}
function defineTempRecord() {
    var i,
        ii;

    appEditor.grader.tempRecord.ssId = "";
    appEditor.grader.tempRecord.ssName = "";
    appEditor.grader.tempRecord.class = "";
    appEditor.grader.tempRecord.scores = [];
    appEditor.grader.tempRecord.comments = [];
    appEditor.grader.tempRecord.feedback = {};
    appEditor.grader.tempRecord.feedback.written = "";
    appEditor.grader.tempRecord.sectionLocked = [];
    appEditor.grader.tempRecord.tempCommentElement = "";
    appEditor.grader.tempRecord.tempSelectedSnippets = [];
    appEditor.grader.tempRecord.sectionNames = [];

    for ( i = 0; i < appEditor.grader.rubric.length; i++ ) {
        appEditor.grader.tempRecord.sectionNames.push(appEditor.grader.rubric[i].sectionName);
        appEditor.grader.tempRecord.scores.push([]);
        appEditor.grader.tempRecord.comments.push("");
        appEditor.grader.tempRecord.sectionLocked.push(false);

        var criterias = appEditor.grader.rubric[i].sectionDef.map(function (el) { return el.criteriaName; });

        for ( ii = 0; ii < criterias.length; ii++ ) {
            appEditor.grader.tempRecord.scores[i].push([]);
        }
    }
    delete appEditor.grader.rubricFilter; //stop all references to the setup now:
    delete appEditor.grader.tempRecord.activeSections;
}

//STUDENT RECORDS IN GRADER

function allgClasses() {
    var uniqueClasses = appEditor.studentData.map( function(el) { return el.stCls; });

    uniqueClasses = (uniqueValues(uniqueClasses)).sort(function(a, b) { return a - b; });
    return uniqueClasses;
}
function getgCandidatesByClass(str) {
    var stdnts;

    stdnts = appEditor.studentData.filter( function (el) { return el.stCls === str; }).map(function (el) { return [el.stId, el.stNme]; }); //filter returns from (boolean)!
    stdnts.sort( function(a, b){ return a[1].localeCompare(b[1]); });
    return stdnts;
}

//STUDENT RECORDS IN RECORDS

function allClasses() {
    var everyClass = appEditor.recordsIndex.map(function (el) { return el.stCls; }); //get from records ONLY
    var uniqueClasses = (uniqueValues(everyClass)).sort(function (a, b) { return a - b; });

    return uniqueClasses;
}
function getOneSetOfRecords(studentId, studentName, studentClss) {
    var returnArr = appEditor.recordsIndex.filter(function (el) {
        return el.stId === studentId && el.stNme === studentName && el.stCls === studentClss;
    });

    return returnArr || [];
}
function showTheMap(scrollId) {
    hideEl("candidateInfo");
    hideEl("recordsContainer");
    hideEl("ac_re_update");
    hideEl("ac_re_exit");
    hideEl("editRecordActions");
    showEl("mapContainer");

    if (typeof scrollId !== undefined && docEl(scrollId) !== null) {
        docEl(scrollId).scrollIntoView({ behavior: "smooth", block: "center" });
    }
}
function exitUpdateRecords() {
    var scrollId = "jk" + appEditor.appEditRecords.tempStudentRecords[0].recordKey;

    toggleAllRecordChkBoxesOff();
    emptyContent(docEl("recordsContainer"));
    appEditor.appEditRecords.tempStudentRecords = [];
    appEditor.appEditRecords.tempStudent.stId = "";
    appEditor.appEditRecords.tempStudent.stNme = "";
    appEditor.appEditRecords.tempStudent.Clss = "";
    appEditor.editorIsOpen.record = false;
    showTheMap(scrollId);
}
function hideTheMap() {
    hideEl("mapContainer");
    showEl("candidateInfo");
    showEl("recordsContainer");
    showEl("ac_re_update");
    showEl("editRecordActions");
    showEl("ac_re_exit");
}
function selectStudentFromDatasets(elId, bool) { //bool: true for records, false for grader
    var el = docEl(elId);
    var chk = [el.dataset.cls, el.dataset.sid, el.dataset.nme];
    var pass = true;
    var i;

    for (i = 0; i < chk.length; i++) {
        if (chk[i] === undefined || chk[i] === "null" || chk[i] === "") {
            pass = false;
            break;
        }
    }
    if (pass === true) {
        if (bool === true) { setSelectedFromMap(el.dataset.cls, el.dataset.sid, el.dataset.nme); }
        else { setSelectedFromgMap(el.dataset.cls, el.dataset.sid, el.dataset.nme); }
    }
}
function findStudentInRecordsMap(el) {
    var subStr;

    if (el.target !== el.currentTarget) {
        subStr = (el.target.id).substring(0, 2);

        switch (subStr) {
            case "jy": selectStudentFromDatasets(el.target.id, true);
                break;
            case "jq": checkAllByClass(el.target.id);
                break;
            case "jw": checkAllByStudent(el.target.id);
                break;
            case "jh": toggleMapContent(el.target.id);
                break;
            case "jx": getAllChkdForDl(el.target.id);
                break;
            case "jz": getAllChkdForDelete(el.target.id);
                break;
            default: return;
        }
        el.stopPropagation();
    }
}
function checkAllByClass(elId) {
    var tbl = "jb" + elId.substring(2);
    var wholeClass = docEl(tbl).querySelectorAll("span.label.label-md");

    wholeClass.forEach(function (el) {
        checkAllByStudent(el.id);
    });
}
function toggleAllRecordChkBoxesOff() { //when exiting appEditor.appEditRecords
    var container = docEl("recordsMap");
    var allRecords = container.querySelectorAll("input.targeted");

    allRecords.forEach(function (record) {
        docEl(record.id).dataset.slct = "none";
        docEl(record.id).checked = false;
    });
}
function checkAllByStudent(elId) {
    var toggle = docEl(elId).dataset.slct; //data-slct = "all" or "none" controls action
    var tr = docEl(elId).parentElement.parentElement;
    var records;

    if (tr == undefined || tr === null) { return; }

    records = tr.querySelectorAll("input.targeted");
    records.forEach(function (record) {
        if (toggle === "all") {
            docEl(elId).dataset.slct = "none";

            if (docEl(record.id).checked !== true) {
                docEl(record.id).checked = true;
            }
        }
        if (toggle === "none") {
            docEl(elId).dataset.slct = "all";

            if (docEl(record.id).checked !== false) {
                docEl(record.id).checked = false;
            }
        }
    });
}
function toggleClassShow(clssNum) {
    docEl("jh" + clssNum).className = docEl("jh" + clssNum).className.replace(/(?:^|\s)collpsd(?!\S)/g, '');
    showEl("jm" + clssNum);
    showEl("jq" + clssNum);
    showEl("jz" + clssNum);
    showEl("jx" + clssNum);
}
function toggleClassHide(clssNum) {
    docEl("jh" + clssNum).className += " collpsd";
    hideEl("jm" + clssNum);
    hideEl("jq" + clssNum);
    hideEl("jz" + clssNum);
    hideEl("jx" + clssNum);
}
function toggleMapContent(elId) {
    var clssNum = elId.substring(2);
    var isCollapsed = docEl("jm" + clssNum).classList.contains("nodisplay");

    if (isCollapsed) {
        toggleClassShow(clssNum);
    } else {
        toggleClassHide(clssNum);
    }
}
function setSelectedFromMap(cls, sid, nme) { //el.dataset.cls, el.dataset.sid, el.dataset.nme
    var thisClass = docEl("thisClass");
    var thisStudent = docEl("thisStudent");

    appEditor.appEditRecords.tempStudent.stId = sid;
    appEditor.appEditRecords.tempStudent.stNme = nme;
    appEditor.appEditRecords.tempStudent.Clss = cls;
    thisClass.value = appEditor.appEditRecords.tempStudent.Clss;
    thisStudent.textContent = appEditor.appEditRecords.tempStudent.stId + " " + appEditor.appEditRecords.tempStudent.stNme;
    hideTheMap();
    buildTempRecords();
}
function getCandidatesByClass(str) {
    var stdnts = appEditor.recordsIndex.filter(function (el) {
        return el.stCls === str;
    }).map(function (elem) {
        return [elem.stId, elem.stNme];
    });

    stdnts.sort(function (a, b) {
        return a[1].localeCompare(b[1]);
    });
    stdnts = uniqueNestedArrs(stdnts, 0);
    return stdnts;
}

//EDITING RECORDS
//IMPORTANT: all names are from records and NOT from studentData

function flattenRecords(indexObj) {
    var keys,
        newIdxRecord;

    if (indexObj === null || isObjEmpty(indexObj)) { return false; }

    keys = Object.keys(indexObj);
    keys.forEach(function (el) {
        newIdxRecord = {};
        newIdxRecord.recordKey = el;
        newIdxRecord.context = indexObj[el].context;
        newIdxRecord.stCls = indexObj[el].studentData.stCls;
        newIdxRecord.stId = indexObj[el].studentData.stId;
        newIdxRecord.stNme = indexObj[el].studentData.stNme;
        newIdxRecord.timeStamp = indexObj[el].timeStamp;
        appEditor.recordsIndex.push(newIdxRecord);
    });
    return true;
}
function displayRecords() {
    emptyContent(docEl("recordsContainer"));
    buildRecordsMap();
    showTheMap();

    if (appEditor.recordsIndex.length) { docEl("recordsHeader").textContent = ""; }
    else { docEl("recordsHeader").textContent = "No records!"; }
    showEl("recordsContainer");
}
function noRecordsSelected() {
    showTheMap();
    displayMsg("p");
}
function loadSelectedStudentRecords() {
    var len = appEditor.appEditRecords.tempStudentRecords.length;
    var i;

    if (!len) { return; }

    emptyContent(docEl("recordsContainer"));
    showEl("candidateInfo");

    for (i = 0; i < len; i++) {
        populateFinalRecordEl(i);
    }
    appEditor.editorIsOpen.record = true;
}
function populateFinalRecordEl(recordIndex) { //loads ONE full record
    var stdntRcrd = appEditor.appEditRecords.tempStudentRecords[recordIndex];
    var allSectionsOfRecord,
        len,
        sectionName,
        i;

    if (stdntRcrd.hasOwnProperty("noRubric") && stdntRcrd.noRubric === true) {
        createFinalRecordElForNoRubric(recordIndex); //one record {} shell
        return;
    }

    createFinalRecordEl(recordIndex); //one record {} shell
    allSectionsOfRecord = stdntRcrd.sectionNames;
    len = allSectionsOfRecord.length;

    for (i = 0; i < len; i++) {
        sectionName = allSectionsOfRecord[i];
        createFinalRecordSectionEl(recordIndex, sectionName, i); //each section of one record
        createFinalRecordCriteriasEl(recordIndex, i); //all criterias within each section of one record
    }
}
function setRecordFeedbck(recordIndex) {
    var targetWritten = docEl("opt1_" + recordIndex);

    targetWritten.textContent = appEditor.appEditRecords.tempStudentRecords[recordIndex].feedback.written;
}
function setRecordRubric(recordIndex) {
    var stdntRcrd = appEditor.appEditRecords.tempStudentRecords[recordIndex];
    var container = docEl("frrA" + recordIndex);
    var frag = document.createDocumentFragment();
    var fbRubric,
        numOfTables,
        numOfRows,
        numOfCells,
        i,
        ii,
        iii;

    emptyContent(container);

    if (stdntRcrd.hasOwnProperty("noRubric") && stdntRcrd.noRubric === true) {
        return;
    }
    fbRubric = stdntRcrd.feedback.rubric;
    numOfTables = fbRubric.length;

    for (i = 0; i < numOfTables; i++) {
        var newTable = document.createElement("table");
        var newThead = document.createElement("thead");
        var newHeadTr = document.createElement("tr");
        var newTbody = document.createElement("tbody");
        var isRowStart;
        var isFirstRow;
        var isColStart;

        newTable.className = "table table-responsive table-striped table-bordered table-condensed";
        numOfRows = fbRubric[i].sectionDef.length;
        isRowStart = true;
        isFirstRow = true;

        for (ii = 0; ii < numOfRows; ii++) { //header row
            numOfCells = fbRubric[i].sectionDef[ii].criteriaDef.length;

            for (iii = 0; iii < numOfCells; iii++) {
                var newTh = document.createElement("th");

                if (isFirstRow === true) {//define the first row
                    if (isRowStart === true) {
                        var newCol1Th = document.createElement("th");

                        newCol1Th.textContent = fbRubric[i].sectionName;
                        newHeadTr.appendChild(newCol1Th);
                        isRowStart = false;
                    }
                    newTh.textContent = fbRubric[i].sectionDef[ii].criteriaDef[iii].score;
                    newHeadTr.appendChild(newTh);
                }
            }
            isFirstRow = false;
        }
        newThead.appendChild(newHeadTr);

        for (ii = 0; ii < numOfRows; ii++) { //body
            var newTr = document.createElement("tr");

            numOfCells = fbRubric[i].sectionDef[ii].criteriaDef.length;
            isColStart = true;

            for (iii = 0; iii < numOfCells; iii++) {
                var newTd = document.createElement("td");

                if (isColStart === true) { //define the first cell (criteria name)
                    var newCol1 = document.createElement("td");

                    newCol1.textContent = fbRubric[i].sectionDef[ii].criteriaName;
                    newTr.appendChild(newCol1);
                    isColStart = false;
                }
                newTd.textContent = fbRubric[i].sectionDef[ii].criteriaDef[iii].descriptor;
                newTr.appendChild(newTd);
            }
            newTbody.appendChild(newTr);
        }
        newTable.appendChild(newThead);
        newTable.appendChild(newTbody);
        frag.appendChild(newTable);
    }
    container.appendChild(frag);
}
function updateDescriptorOnScoreChange(criteriaId) { //"ff" + recordIndex + "-" + sectionIndex + "-" + criteriaIdx + "-1"
    var idx = docEl(criteriaId).selectedIndex;
    var descr,
        idxArr;

    if (idx == undefined) { return; }

    idxArr = buildTokens(criteriaId.substring(2), "-");
    descr = appEditor.appEditRecords.tempStudentRecords[idxArr[0]].feedback.rubric[idxArr[1]].sectionDef[idxArr[2]].criteriaDef[idx].descriptor;
    docEl("ff" + idxArr[0] + "-" + idxArr[1] + "-" + idxArr[2] + "-3").textContent = descr;
}
function checkForNullSectionFields(recordIndex, sectionIndex) {
    var sectionId = "opt4_" + recordIndex + "_" + sectionIndex || "";
    var chkSection = "ok";

    if (docEl(sectionId).value === "") { chkSection = "Please check the names of each section."; }
    return chkSection;
}
function chkForDupSectionNames(savedArr, sectionIds) {
    var chkSection = "ok";

    sectionIds = uniqueValues(sectionIds);

    if (savedArr.length !== sectionIds.length) { chkSection = "Please check that the names of each section are unique."; }
    return chkSection;
}
function chkAllRecordsBeforeUpdate() { //called on "save" button
    var recordLen,
        el,
        sectionChk,
        criteriaChk,
        contextChk,
        genScoreChk,
        sectionLen,
        criteriaLen,
        sectionIds,
        i,
        ii,
        iii;

    if (!appEditor.appEditRecords.tempStudentRecords.length) { return; }
    if (docEl("thisClass").value === "") {
        displayMsg("q");
        return;
    }
    recordLen = appEditor.appEditRecords.tempStudentRecords.length;
    sectionChk = "ok";
    criteriaChk = "ok";
    contextChk = "ok";
    genScoreChk = "ok";

    //check for empty or invalid fields on the UI...
    //MUST SKIP sections that have prop: "null_marked_for_deletion" in data, or will hit el.s that don't exist in the DOM
    for (i = 0; i < recordLen; i++) {
        el = appEditor.appEditRecords.tempStudentRecords[i];

        if (el.hasOwnProperty("null_marked_for_deletion")) { continue; }

        if (el.hasOwnProperty("noRubric") && el.noRubric === true) {
            genScoreChk = getGenScoreForNoRubric("ts" + i, "tm" + i)[0];
            if (genScoreChk === "error") {
                break;
            } else {
                genScoreChk = "ok";
                continue;
            }
        }
        if (docEl("fc" + i).value === "") {
            contextChk = "All grading contexts MUST be defined!";
            break;
        }
        sectionLen = el.scores.length;
        sectionIds = []; //keep clear for each record

        for (ii = 0; ii < sectionLen; ii++) {
            sectionChk = checkForNullSectionFields(i, ii);
            if (sectionChk !== "ok") {
                break;
            }
            criteriaLen = el.scores[ii].length;

            for (iii = 0; iii < criteriaLen; iii++) {
                criteriaChk = checkForBadCriteriaFields(i, ii, iii);
                if (criteriaChk !== "ok") {
                    break;
                }
            }
            sectionIds.push(docEl("opt4_" + i + "_" + ii).value || "");
        }
        sectionChk = chkForDupSectionNames(el.sectionNames, sectionIds);

        if (sectionChk !== "ok") {
            break;
        }
    }
    if (contextChk === "ok" && sectionChk === "ok" && criteriaChk === "ok" && genScoreChk === "ok") {
        updateRecords();
        return;
    }
    if (contextChk !== "ok") {
        displayMsg("c", contextChk);
        return;
    }
    if (sectionChk !== "ok") {
        displayMsg("c", sectionChk);
        return;
    }
    if (criteriaChk !== "ok") {
        displayMsg("c", criteriaChk);
        return;
    }
}
function checkForBadCriteriaFields(recordIndex, sectionIndex, criteriaIndex) {
    var criteriaId = "ff" + recordIndex + "-" + sectionIndex + "-" + criteriaIndex + "-";
    var scoreVal = docEl(criteriaId + "1").options[docEl(criteriaId + "1").selectedIndex].value;
    var sendAlert = "ok";

    if (numsOnly(scoreVal) === "") { sendAlert = "Please check all scores."; }
    return sendAlert;
}
function createIndexObjForDb(recordObj) {  //n.b.: no recordKey prop!
    var recordindexObj = { context: recordObj.context, studentData: recordObj.studentData, timeStamp: recordObj.timeStamp };

    return recordindexObj;
}
function removeRecordKeyFromObjForDb(recordObj) {
    var copyObj = {};

    copyObj.context = recordObj.context;
    copyObj.feedback = recordObj.feedback;
    copyObj.studentData = recordObj.studentData;
    copyObj.timeStamp = recordObj.timeStamp;

    if (recordObj.hasOwnProperty("noRubric") && recordObj.noRubric === true) {
        copyObj.noRubric = true;
        copyObj.noRubricScore = recordObj.noRubricScore;
    } else {
        copyObj.comments = recordObj.comments;
        copyObj.scores = recordObj.scores;
        copyObj.sectionNames = recordObj.sectionNames;
    }
    return copyObj;
}
function saveUpdateRecordsInAppEditor() {
    var idx,
        obj,
        objIdx,
        i;

    for (i = appEditor.appEditRecords.tempStudentRecords.length - 1; i >= 0; i--) {
        obj = appEditor.appEditRecords.tempStudentRecords[i];
        idx = appEditor.recordsIndex.map(function (el) { return el.recordKey; }).indexOf(obj.recordKey);

        if (idx !== -1) { //chk which records are null and splice them...
            if (obj.hasOwnProperty("null_marked_for_deletion")) {
                if (obj.null_marked_for_deletion === true) {
                    appEditor.recordsIndex.splice(idx, 1);
                }
            } else {
                objIdx = {
                    stCls: obj.studentData.stCls,
                    stId: obj.studentData.stId,
                    stNme: obj.studentData.stNme,
                    context: obj.context,
                    recordKey: obj.recordKey,
                    timeStamp: obj.timeStamp
                };
                appEditor.recordsIndex[idx] = objIdx;
            }
        }
    }
}
function updateRecords() {
    var recordLen = appEditor.appEditRecords.tempStudentRecords.length;
    var sectionLen,
        criteriaLen,
        recordObj,
        genScore,
        i,
        ii,
        iii;

    if (recordLen === 0) { return; }

    for (i = 0; i < recordLen; i++) {
        recordObj = appEditor.appEditRecords.tempStudentRecords[i];

        if (recordObj.hasOwnProperty("null_marked_for_deletion")) { continue; } //we cant delete individual records marked for deletion...we need to know if this prop exists to update the database with a null value
        if (docEl("thisClass").value !== appEditor.appEditRecords.tempStudent.Clss) { recordObj.studentData.stCls = docEl("thisClass").value; }

        recordObj.context = docEl("fc" + i).value;
        //recordObj.feedback.written = docEl("opt1_" + i).textContent;
        recordObj.feedback.written = fixNewlinesInContentEditable("opt1_" + i);

        if (recordObj.hasOwnProperty("noRubric") && recordObj.noRubric === true) {
            recordObj.noRubric = true;
            recordObj.noRubricScore = {};
            genScore = getGenScoreForNoRubric("ts" + i, "tm" + i);
            recordObj.noRubricScore.scr = genScore[0];
            recordObj.noRubricScore.max = genScore[1];
            recordObj.feedback.rubricChkd = false;
            continue;
        }
        recordObj.feedback.rubricChkd = docEl("opt2_" + i).checked;
        sectionLen = recordObj.scores.length;

        for (ii = 0; ii < sectionLen; ii++) {
            //recordObj.comments[ii] = docEl("opt3_" + i + "_" + ii).textContent;
            recordObj.comments[ii] = fixNewlinesInContentEditable("opt3_" + i + "_" + ii);
            recordObj.sectionNames[ii] = docEl("opt4_" + i + "_" + ii).value;
            criteriaLen = recordObj.scores[ii].length;

            for (iii = 0; iii < criteriaLen; iii++) {
                var criteriaId = "ff" + i + "-" + ii + "-" + iii + "-";
                recordObj.scores[ii][iii][1] = docEl(criteriaId + "1").options[docEl(criteriaId + "1").selectedIndex].value;
                recordObj.scores[ii][iii][3] = docEl(criteriaId + "3").textContent;
            }
        }
    }
    saveUpdatedRecords();
}
function markRecordForDeletion(sTokens) { //"fh0" is the id of the record!
    var el = docEl("fh" + sTokens[0]);
    var recordObj = appEditor.appEditRecords.tempStudentRecords[sTokens[0]];
    var dateTime = new Date(recordObj.timeStamp).toLocaleString();

    recordObj.null_marked_for_deletion = true;
    emptyContent(el);
    el.className += " delPending";
    el.textContent = recordObj.context + " " + dateTime;
}
function deleteRecordIsClicked(elId) {
    var sTokens = buildTokens(elId.substring(2), "-"); //"fx0-0"

    if (sTokens.length === 2 && sTokens[0] === 0) {
        markRecordForDeletion(sTokens);
    }
}
function switchObjForTokens(elId) {
    var sbStr = elId.substring(0, 2);

    switch (sbStr) {
        case "fx": deleteRecordIsClicked(elId);
            break;
        case "fv": showRecordRubricSection(elId);
            break;
        case "fw": hideRecordRubricSection(elId);
            break;
        default: return;
    }
}
function hideRecordRubricSection(elId) {
    var idx = elId.substring(2);

    showEl("fh" + idx);
    hideEl("fq" + idx);
}
function showRecordRubricSection(elId) {
    var idx = elId.substring(2);

    hideEl("fh" + idx);
    showEl("fq" + idx);
}
function setLabelIndex(elId) {
    if (elId.substring(0, 5) === "opt5_") {
        appEditor.appEditRecords.labelIndex = Number(elId.substring(5));
    }
}
function identifySelectopt(el) {
    if (el.target !== el.currentTarget) {
        if (el.target.nodeName === "SELECT") {
            //onchange Score dropdown: update the relevant descriptor from the accompanying rubric
            updateDescriptorOnScoreChange(el.target.id);
        }
        el.stopPropagation();
    }
}
function identifyEditRecordEl(el) {
    if (el.target !== el.currentTarget) {
        if (el.target.nodeName !== "SELECT") {
            if (el.target.nodeName === "LABEL") {
                setLabelIndex(el.target.id);
            } else {
                switchObjForTokens(el.target.id);
            }
        }
        el.stopPropagation();
    }
}

//PDF
//TODO: replace base64 with blob

function pdfMakePromise(recordContent) {
    var pdfDocGenerator = pdfMake.createPdf(recordContent);

    return new window.Promise(function (resolve) {
        pdfDocGenerator.getBase64(function (pdfBase64) {
            resolve(pdfBase64);
        });
    });
}
function pdfObjPromise(recordObj) {
    return new window.Promise(function (resolve) {
        pdfMakePromise(recordObj.content).then(function (result) {
            recordObj.content = {};
            recordObj.content.base64 = result;
            resolve(recordObj);
        });
    });
}
function dlSingleRecord(recordObj, elId) {
    var pdfObj = buildPDFrecord(recordObj);
    var pdfName = '' + recordObj.studentData.stCls + '_' + recordObj.studentData.stNme + '_' + recordObj.studentData.stId + '_' + recordObj.context + '.pdf';

    pdfMake.createPdf(pdfObj).download(pdfName);
    resetUiAfterDwnld(elId);
}
function buildPDFrecord(recordObj) {
    var pdfObj = {};
    var count;
    var totalScore = [0, 0];
    var i;
    var ii;
    var pdfDate = new Date(recordObj.timeStamp).toLocaleDateString();
    var displayName = recordObj.studentData.stId + " " + recordObj.studentData.stNme;
    var displayNameURI = getTextAsImageURI(displayName);

    pdfObj.styles = { header: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] }, subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] }, tableExample: { margin: [0, 3, 0, 3] }, tableHeader: { bold: true, fontSize: 13, color: "black" }, smallerTxt: { fontSize: 8 } };
    pdfObj.defaultStyle = { fontSize: 11 };
    pdfObj.pageSize = "A4"; //A4 pageSize: 595.28 - (40 x 2 margin)
    pdfObj.content = [];
    pdfObj.pageBreakBefore = function (currentNode, followingNodesOnPage /*,nodesOnNextPage,previousNodesOnPage*/) { return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0; };
    pdfObj.content.push({ text: pdfDate, alignment: "left", fontSize: 10, margin: [0, -10, 0, 1] });
    pdfObj.content.push({ columns: [{ text: recordObj.context, alignment: "left", fontSize: 14 }, { image: displayNameURI, width: 100, alignment: "right" }] });

    for (i = 0; i < recordObj.scores.length; i++) {
        count = 0;
        for (ii = 0; ii < recordObj.scores[i].length; ii++) {
            var scre = recordObj.scores[i][ii][1];
            var mxScre = recordObj.scores[i][ii][2];

            if (count === 0) {
                pdfObj.content.push({ text: recordObj.sectionNames[i], fontSize: 12, bold: true, margin: [0, 6, 0, 3] });
            }
            totalScore[0] += Number(scre);
            totalScore[1] += Number(mxScre);

            if (recordObj.scores[i][ii][3] === "") { //then there is no descriptor and therefore no fillColor...
                pdfObj.content.push({ text: recordObj.scores[i][ii][0] + ": " + scre + "/" + mxScre }, { style: "tableExample", table: { widths: ["*"], body: [[{ border: [false, false, false, false], text: "", fontSize: 10 }]] }, layout: { "defaultBorder": false } });
            } else {
                pdfObj.content.push({ text: recordObj.scores[i][ii][0] + ": " + scre + "/" + mxScre }, { style: "tableExample", table: { widths: ["*"], body: [[{ border: [false, false, false, false], fillColor: "#eeeeee", text: recordObj.scores[i][ii][3], fontSize: 10 }]] }, layout: { "defaultBorder": false } });
            }
            count++;
        }

        if (recordObj.comments[i] !== "") {
            pdfObj.content.push({ text: "Comment:" }, { style: "tableExample", table: { widths: ["*"], body: [[{ border: [false, false, false, false], text: recordObj.comments[i], fontSize: 10 }]] }, layout: { defaultBorder: false } });
        }
    }
    pdfObj.content.push({ text: "" + totalScore[0] + "/" + totalScore[1] + "", alignment: "right", fontSize: 14, margin: [0, 6, 0, 0] });

    if (recordObj.feedback.written !== "") {
        pdfObj.content.push({ text: "General Feedback:", fontSize: 12, bold: true, margin: [0, 6, 0, 3] });
        pdfObj.content.push({ text: recordObj.feedback.written, fontSize: 11, margin: [0, 0, 0, 3] });
    }
    if (recordObj.feedback.rubricChkd === true) {
        for (i = 0; i < recordObj.feedback.rubric.length; i++) {
            pdfObj.content.push(fullRubricForPdf(recordObj.feedback.rubric[i]));
        }
    }
    clearTxtCanvas();
    return pdfObj;
}
function fullRubricForPdf(rubricSection) {
    var fullRubricPdfObj = { pageBreak: 'before', pageOrientation: 'landscape', style: 'smallerTxt', table: { headerRows: 1, dontBreakRows: true, keepWithHeaderRows: 1, body: [] } };
    var i,
        ii;
    var numOfRows = rubricSection.sectionDef.length;
    var isRowStart = true;
    var isFirstRow = true;
    var isColStart;
    var numOfCells;
    var arr = [];

    for (i = 0; i < numOfRows; i++) { //header row
        numOfCells = rubricSection.sectionDef[i].criteriaDef.length;

        for (ii = 0; ii < numOfCells; ii++) {
            if (isFirstRow === true) { //define the first row
                if (isRowStart === true) {
                    arr.push("RUBRIC\r\n" + rubricSection.sectionName);
                    isRowStart = false;
                }
                arr.push(rubricSection.sectionDef[i].criteriaDef[ii].score);
            }
        }
        isFirstRow = false;
    }
    fullRubricPdfObj.table.body.push(arr);

    for (i = 0; i < numOfRows; i++) { //body
        arr = [];
        numOfCells = rubricSection.sectionDef[i].criteriaDef.length;
        isColStart = true;

        for (ii = 0; ii < numOfCells; ii++) {
            if (isColStart === true) {
                arr.push(rubricSection.sectionDef[i].criteriaName);
                isColStart = false;
            }
            arr.push(rubricSection.sectionDef[i].criteriaDef[ii].descriptor);
        }
        fullRubricPdfObj.table.body.push(arr);
    }

    return fullRubricPdfObj;  //append to content []
}
function dlNewRecord() {
    var pdfObj = buildNewPDFrecord();
    var ssClassPdf = charsToUnderscore(appEditor.grader.tempRecord.class);
    var ssIdPdf = charsToUnderscore(appEditor.grader.tempRecord.ssId);
    var ssNamePdf = charsToUnderscore(appEditor.grader.tempRecord.ssName);

    pdfMake.createPdf(pdfObj).download('' + ssClassPdf + '_' + ssNamePdf + '_' + ssIdPdf + '_' + appEditor.grader.tempRecord.context + '.pdf');
}
function buildNewPDFrecord(){
    var pdfObj = {};
    var totalScore = [0,0];
    var strScore = "";
    var dateTime = Date.now();
    var pdfDate = new Date(dateTime).toLocaleDateString();
    var displayName = appEditor.grader.tempRecord.ssId + " " + appEditor.grader.tempRecord.ssName;
    var displayNameURI = getTextAsImageURI(displayName);
    var recordVal,
        genScore,
        count,
        i,
        ii;

    pdfObj.styles = {header:{fontSize:14,bold:true,margin:[0,0,0,10]},subheader:{fontSize:12,bold:true,margin:[0,10,0,5]},tableExample:{margin:[0,3,0,3]},tableHeader:{bold:true,fontSize:13,color:"black"},smallerTxt:{fontSize:8}};
    pdfObj.defaultStyle = {fontSize:11};
    pdfObj.pageSize = "A4"; //A4 pageSize: 595.28 - (40 x 2 margin)
    pdfObj.content = [];
    pdfObj.pageBreakBefore = function(currentNode,followingNodesOnPage /*,nodesOnNextPage,previousNodesOnPage*/){return currentNode.headlineLevel===1&&followingNodesOnPage.length=== 0;};
    pdfObj.content.push({text:pdfDate,alignment:"left",fontSize:10,margin:[0,-10,0,1]});
    pdfObj.content.push({columns:[{text:appEditor.grader.tempRecord.context,alignment:"left",fontSize:14},{image:displayNameURI,width:100,alignment:"right"}]});

    if (appEditor.grader.noRubricCommentsOnly === true) {
        genScore = getGenScoreForNoRubric("gOvrllScr", "gOvrllMax");

        if (genScore[0] !=="" && (genScore[1] !=="" || genScore[1] !=="0")) {
            strScore += genScore[0] + "/" + genScore[1];
        }
    } else {
        for ( i = 0; i < appEditor.grader.tempRecord.scores.length; i++ ) {
            count = 0;
            for ( ii = 0; ii < appEditor.grader.tempRecord.scores[i].length; ii++ ) {
                recordVal = getTempRecordVariables(i, ii);
                if (count === 0) {
                    pdfObj.content.push({text:recordVal.sectionName,fontSize:12,bold:true,margin:[0,6,0,3]});
                }
                totalScore[0] += Number(recordVal.score);
                totalScore[1] += Number(recordVal.maxScore);
                pdfObj.content.push({text:recordVal.criteria + ": " + recordVal.score + "/" + recordVal.maxScore},{style:"tableExample",table:{widths:["*"],body:[[{border:[false,false,false,false],fillColor:"#eeeeee",text:recordVal.descriptor,fontSize:10}]]},layout:{"defaultBorder":false}});
                count++;
            }
            if (appEditor.grader.tempRecord.comments[i] !=="") {
                var aComment = appEditor.grader.tempRecord.comments[i];
                pdfObj.content.push({text:"Comment:"},{style:"tableExample",table:{widths:["*"],body:[[{border:[false,false,false,false],text:aComment,fontSize:10}]]},layout:{defaultBorder:false}});
            }
        }
        strScore += totalScore[0] + "/" + totalScore[1];
    }
    pdfObj.content.push({text:strScore,alignment:"right",fontSize:14,margin:[0,6,0,0]});

    if (appEditor.grader.tempRecord.feedback.written !=="") {
        pdfObj.content.push({text:"General Feedback:",fontSize:12,bold:true,margin:[0,6,0,3]});
        if (appEditor.grader.tempRecord.feedback.written !=="") {
             var feedbackComment = appEditor.grader.tempRecord.feedback.written;
             pdfObj.content.push({text:feedbackComment,fontSize:11,margin:[0,0,0,3]});
        }
    }
    if (document.getElementById("gRbChkd").checked === true){
        for ( i = 0; i < appEditor.grader.rubric.length; i++ ) {
            pdfObj.content.push(fullRubricForNewPdf(appEditor.grader.rubric[i]));
        }
    }
    clearTxtCanvas();
    return pdfObj;
}
function fullRubricForNewPdf(rubricSection) {
    var fullRubricPdfObj = {
        pageBreak: 'before',
        pageOrientation: 'landscape',
        style: 'smallerTxt',
        table: {
            headerRows: 1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            body: []
        }
    };
    var numOfRows = rubricSection.sectionDef.length;
    var isRowStart = true;
    var isFirstRow = true;
    var arr = [];
    var isColStart,
        numOfCells,
        i,
        ii;

    for (i = 0; i < numOfRows; i++) { //header row
        numOfCells = rubricSection.sectionDef[i].criteriaDef.length;

        for (ii = 0; ii < numOfCells; ii++) {
            if (isFirstRow === true){//define the first row
                if (isRowStart === true) {
                    arr.push("RUBRIC\r\n" + rubricSection.sectionName);
                    isRowStart = false;
                }
                arr.push(rubricSection.sectionDef[i].criteriaDef[ii].score);
            }
        }
        isFirstRow = false;
    }
    fullRubricPdfObj.table.body.push(arr);

    for (i = 0; i < numOfRows; i++) { //body
        arr = [];
        numOfCells = rubricSection.sectionDef[i].criteriaDef.length;
        isColStart = true;

        for (ii = 0; ii < numOfCells; ii++) {
            if (isColStart === true) {
                arr.push(rubricSection.sectionDef[i].criteriaName);
                isColStart = false;
            }
            arr.push(rubricSection.sectionDef[i].criteriaDef[ii].descriptor);
        }
        fullRubricPdfObj.table.body.push(arr);
    }
    return fullRubricPdfObj;  //append to content []
}

// DOWNLOADS

async function saveFile(data) {
    try {
        const handle = await showSaveFilePicker({
            suggestedName: "Record_downloads.zip",
            types: [{ accept: {"application/zip": [".zip"]} }] //application/octet-stream
        });
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return;
    }
    catch(e) {
        return;
    }
}
function addToZip(pdfObjArr, elId) {
    var allPromises = [];

    pdfObjArr.forEach(function (recordObj) {
        allPromises.push(pdfObjPromise(recordObj));
    });
    window.Promise.all(allPromises).then(function (resultArr) {
        makeZipAndDl(resultArr, elId);
    });
}
function makeZipAndDl(resultArr, elId) {
    let zip = new JSZip();

    resultArr.forEach(function (recordObj) {
        zip.file(recordObj.name, recordObj.content.base64, { base64: true });
    });
    zip.generateAsync({ type: "blob" }).then(function (data) {
        saveFile(data).then(function () {
            resetUiAfterDwnld(elId);
        });
    });
}