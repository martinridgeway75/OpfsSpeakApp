/*(c) 2019 Martin Ridgeway <martin@ridgeway.io> MIT license*/
/*A very special thanks to Anna Otterstad and Lee Gaskell - who generously gave their time to help test and improve the app*/

let appEditor = {};

//DB COMS

function deleteRecordsViaMap(checkedRecords) {
    const ctx = "" + /*appEditor.settings.dbCtx*/ + "/" + auth.currentUser.uid;
    const updates = {};

    checkedRecords.forEach( function (el) {
        const recordIdxPath = ctx + "/recordsIndex/" + el;
        const recordPath = ctx + "/records/" + el;

        updates[recordIdxPath] = null;
        updates[recordPath] = null;
    });
    update(ref(db), updates).then(() => {
        updateDeletionOfRecordsInAppEditor(checkedRecords);
        displayMsg("o");
        buildRecordsMap(); //changes will be reflected onreload here
    }).catch((error) => {
        chkPermission(error);
        displayMsg("n", error);
    });
}
function fetchSingleRecordForDownload(recordKey, elId) {
    const path = "" + /*appEditor.settings.dbCtx*/ + "/" + auth.currentUser.uid + "/records/" + recordKey;

    onValue(ref(db, path), (snapshot) => {
        const recordObj = snapshot.val();

        if (recordObj !== null) {
            recordObj.recordKey = recordKey; //add recordKey here so we can update changes by key directly
            dlSingleRecord(recordObj, elId);
        }
    }, (error) => {
        chkPermission(error);
    }, {
        onlyOnce: true
    });
}
function fetchSelectedRecordsForDownload(checkedRecords, elId) { //promises!
    const ctx = "" + /*appEditor.settings.dbCtx*/ + "/" + auth.currentUser.uid;
    const len = checkedRecords.length;
    let pdfObjArr = [];
    let path;
    let pdfObj;
    let recordObj;

    checkedRecords.forEach( function(recordKey) {
        path = ctx + "/records/" + recordKey;

        onValue(ref(db, path), (snapshot) => {
            recordObj = snapshot.val();

            if (recordObj !== null) {
                recordObj.recordKey = recordKey; //add recordKey here so we can update changes by key directly
                pdfObj = {};
                pdfObj.content = buildPDFrecord(recordObj);
                pdfObj.name = '' + recordObj.studentData.stCls + '_' + recordObj.studentData.stNme + '_' + recordObj.studentData.stId + '_' + recordObj.context+ '_' + recordObj.timeStamp + '.pdf';
                pdfObjArr.push(pdfObj);

                if (pdfObjArr.length === len) { addToZip(pdfObjArr, elId); }
            }
        }, (error) => {
            chkPermission(error);
        }, {
            onlyOnce: true
        });
    });
}
function saveUpdatedRecords() { //@db...only records for the current temp student are being updated
    const ctx = "" + /*appEditor.settings.dbCtx*/ + "/" + auth.currentUser.uid;
    const updates = {};
    let recordIdxPath;
    let recordPath;

    if (appEditor.appEditRecords.tempStudentRecords.length) {
        appEditor.appEditRecords.tempStudentRecords.forEach( function (el) {
            recordIdxPath = ctx + "/recordsIndex/" + el.recordKey;
            recordPath = ctx + "/records/" + el.recordKey;

            if ( el.hasOwnProperty("null_marked_for_deletion")) {
                if (el.null_marked_for_deletion === true) {
                    updates[recordIdxPath] = null;
                    updates[recordPath] = null;
                }
            } else {
                updates[recordIdxPath] = createIndexObjForDb(el);
                updates[recordPath] = removeRecordKeyFromObjForDb(el);
            }
        });
        update(ref(db), updates).then(() => {
            saveUpdateRecordsInAppEditor();
            displayMsg("r");
            buildRecordsMap(); //changes will be reflected onreload here
            exitUpdateRecords();
        }).catch((error) => {
            chkPermission(error);
            displayMsg("a", error);
        });
    }
}
// function graderNeedsStudentDataFromDb() {
//     if (appEditor.db.students !== false) { return; }

//     const path = "" + appEditor.settings.dbCtx + "/" + auth.currentUser.uid + "/studentData";

//     onValue(ref(db, path), (snapshot) => {
//         appEditor.studentData = snapshot.val() || [];
//         appEditor.db.students = true;

//         initStudentData();
//         studentInfoHandlersOn();

//         if (appEditor.db.snippets === false) { //xtra call to db for snippets
//             getSnippetsFromDb();
//         }
//         initGrader();
//     }, (error) => {
//         chkPermission(error);
//     }, {
//         onlyOnce: true
//     });
// }
// function getEverythingGraderNeedsFromDb() {
//     if (appEditor.db.rubrics === false) {
//         const path = "" + appEditor.settings.dbCtx + "/" + auth.currentUser.uid + "/savedRubricsIndex";

//         onValue(ref(db, path), (snapshot) => {
//             appEditor.rubricsIndex = snapshot.val() || {};
//             appEditor.db.rubrics = true;
//             if (appEditor.db.snippets === false) { //async call to db for snippets
//                 getSnippetsFromDb();
//             }
//             if (!isObjEmpty(appEditor.rubricsIndex)) {
//                 showEl("gaLoadChkBoxes");
//                 loadRubriks();
//             }
//             rubrikHandlersOn();
//             graderNeedsStudentDataFromDb();
//             return;
//         }, (error) => {
//             chkPermission(error);
//         }, {
//             onlyOnce: true
//         });
//     } else if (appEditor.db.students === false) {
//         graderNeedsStudentDataFromDb();
//         return;
//     } else {
//         initGrader();
//     }
// }
// function getRubricIndexesBeforeGetSnippets(uid) {
//     const path = "" + appEditor.settings.dbCtx + "/" + uid + "/savedRubricsIndex";

//     onValue(ref(db, path), (snapshot) => {
//         appEditor.rubricsIndex = snapshot.val() || {};
//         appEditor.db.rubrics = true;
//         getSnippetsFromDb();

//         if (!isObjEmpty(appEditor.rubricsIndex)) {
//             showEl("ruLoadSelected");
//             loadRubriks();
//         }
//         rubrikHandlersOn();
//     }, (error) => {
//         chkPermission(error);
//     }, {
//         onlyOnce: true
//     });
// }
function getRecordsIndexFromDb() {
    const path = "" + /*appEditor.settings.dbCtx*/ + "/" + auth.currentUser.uid + "/recordsIndex";

    onValue(ref(db, path), (snapshot) => {
        const flatRec = flattenRecords(snapshot.val());

        appEditor.db.records = true;

        if (flatRec === false) { //false would be null
            appEditor.recordsIndex = [];
        }
        displayRecords();
        recordsHandlersOn();     
    }, (error) => {
        chkPermission(error);
    }, {
        onlyOnce: true
    });
}
function pushRecordsToDb(dataObj) {
    const ctx = "" + /*appEditor.settings.dbCtx*/ + "/" + auth.currentUser.uid;
    const postData = { timeStamp: dataObj.timeStamp, context: dataObj.context, studentData: dataObj.studentData };
    const objPath = ctx + "/recordsIndex/";
    const newPostKey = push(child(ref(db), objPath)).key;
    const recordIdxPath = ctx + "/recordsIndex/" + newPostKey;
    const recordPath = ctx + "/records/" + newPostKey;
    const updates = {};

    updates[recordIdxPath] = postData;
    updates[recordPath] = dataObj;

    update(ref(db), updates).then(() => {
        displayMsg("s");

        if (appEditor.db.records === true) {
            addNewRecordToRecordsIndex(newPostKey, postData);
        }
        resetDataEntry();
    }).catch((error) => {
        chkPermission(error);
        displayMsg("a", error);
    });
}
function getRecordsIndexFromDbAtInit() {
    const path = "" + /*appEditor.settings.dbCtx*/ + "/" + auth.currentUser.uid + "/recordsIndex";
    
    onValue(ref(db, path), (snapshot) => {
        const flatRec = flattenRecords(snapshot.val());

        appEditor.db.records = true;
        initSuccess();

        if (flatRec === false) { //false would be null
            appEditor.recordsIndex = [];
        }
        displayRecords();
        recordsHandlersOn();
    }, (error) => {
        chkPermission(error);
    }, {
        onlyOnce: true
    });
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

//RUBRICS IN GRADER

function getGenScoreForNoRubric(elId1, elId2) {
    var scr = numsOnly(docEl(elId1).value);
    var max = numsOnly(docEl(elId2).value);
    var returnArr = ["",""];

    if (!Number.isNaN(scr) && !Number.isNaN(max)) { //if (scr !== NaN && max !== NaN ) {
        returnArr[0] = "" + scr;
        returnArr[1] = "" + max;
    }
    if (scr > max) {
        displayMsg("z");
        returnArr[0] = "error";
    }
    return returnArr;
}
function getSectionNames(arr) {
    var allSections = arr.map(function (el) { return el.sectionName; });

    return allSections;
}
//active sections only from appEditor.grader.rubricFilter -> a slimmer rubric object that has the sections in the same order as appEditor.grader.tempRecord.activeSections
//using this to build appEditor.grader.tempRecord -> appEditor.grader.tempRecord.scores MUST be in the same array order as temp.rubric!
function createSlimRubric() {
    var newRubric = [];

    for (var i = 0; i < appEditor.grader.tempRecord.activeSections.length; i++) {
        newRubric.push(appEditor.grader.rubricFilter[appEditor.grader.tempRecord.activeSections[i]]); //newRubric is not a reference!
    }
    return newRubric;
}
function loadGraderRubriks() {
    var keysArr = Object.keys(appEditor.rubricsIndex);
    var len = keysArr.length;
    var i;

    hideEl("gaLoading");
    emptyContent(docEl("gaLoadChkBoxes"));
    createNoRubricGradingRubrikButton(); //default: no rubric

    if (len) {
        for (i = 0; i < len; i++) {
            createGradingRubriksButtons(keysArr[i], appEditor.rubricsIndex[keysArr[i]].rubricName);
        }
        setUpHandlersOn();
        appEditor.editorIsOpen.graderSetup = true;
    }
}
function getNoRubricRubric() {
    appEditor.grader.noRubricCommentsOnly = true;
    appEditor.grader.loadedRubric = [];
    showSectionsForSelectedRubric(null);
    finishInit();
}
function addSelectedToActiveSectionsArr(sectionIndex) {
    var allSectionKeys = getSectionNames(appEditor.grader.rubricFilter);

    if (sectionIndex !== "" && sectionIndex !== "undefined") {
        if (appEditor.grader.tempRecord.activeSections.indexOf(sectionIndex) === -1 && allSectionKeys[sectionIndex] !== "undefined") {
            appEditor.grader.tempRecord.activeSections.push(sectionIndex);
        }
    }
    updateSetupNums();
}
function removeSelectedFromActiveSectionsArr(sectionIndex) {
    var index = appEditor.grader.tempRecord.activeSections.indexOf(sectionIndex);

    if (index !== -1) { appEditor.grader.tempRecord.activeSections.splice(index, 1); }
    updateSetupNums();
}
function updateSetupNums() {
    var targetLength = appEditor.grader.tempRecord.activeSections.length;
    var allSectionsLength = getSectionNames(appEditor.grader.rubricFilter).length;
    var targetId;
    var i;

    for (i = 0; i < allSectionsLength; i++) { //clear all helper numbers...
        targetId = "gs" + i;
        docEl(targetId).textContent = "";
    }
    if (targetLength > 0) { //update all helper numbers on the UI (next to each chkbx)
        for (i = 0; i < targetLength; i++) {
            targetId = "gs" + appEditor.grader.tempRecord.activeSections[i]; //the target helper number div
            docEl(targetId).textContent = (i + 1);
        }
    }
}
function setTempRecordScore(idxArr) {
    appEditor.grader.tempRecord.scores[idxArr[0]][idxArr[1]] = [];
    appEditor.grader.tempRecord.scores[idxArr[0]][idxArr[1]] = idxArr; //.push(idxArr[0], idxArr[1], idxArr[2]);
}
function updateGradingDescriptorOnScoreChange(criteriaId) { //"gf" + sectionIndex + "-" + criteriaIdx + "-" + selectedIndex
    var idx = docEl(criteriaId).selectedIndex - 1; //placeholder: "" @selectedIndex[0]
    var descr;
    var idxArr = (criteriaId.substring(2)).split("-");

    if (idxArr.length === 3) {
        idxArr[0] = Number(idxArr[0]);
        idxArr[1] = Number(idxArr[1]);
        idxArr[2] = idx;

        if (idx !== -1) {
            setTempRecordScore(idxArr);
            descr = appEditor.grader.rubric[idxArr[0]].sectionDef[idxArr[1]].criteriaDef[idx].descriptor;
            docEl("gf" + idxArr[0] + "-" + idxArr[1] + "-3").textContent = descr;
        } else {
            appEditor.grader.tempRecord.scores[idxArr[0]][idxArr[1]] = []; //clear tempRecordScore
            docEl("gf" + idxArr[0] + "-" + idxArr[1] + "-3").textContent = "";
        }
    }
}
function populateGraderUI() {
    var len = appEditor.grader.rubric.length;
    var i;

    docEl("titleHeader").textContent = appEditor.grader.tempRecord.context;
    createUISections();

    for (i = 0; i < len; i++) { //each section table here
        createSectionElTables(i);
    }
    for (i = 0; i < len; i++) {
        createGradingCriteriasEl(i);
    }
}

//RECORDS
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
        fetchSingleRecordForDownload(checkedRecords[0], elId);
        return;
    }
    fetchSelectedRecordsForDownload(checkedRecords, elId);
}

//NEW RECORDS IN GRADER

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
function commitNewRecord() {
    var allready = saveTempRecord();
    var dataObj;

    if (allready !== true) { return; }

    dataObj = createFinalRecord();
    pushRecordsToDb(dataObj);
}
function dlNewRecordAndSave() {
    var allready = saveTempRecord();
    var dataObj;

    if (allready !== true) { return; }

    dlNewRecord();
    dataObj = createFinalRecord();
    pushRecordsToDb(dataObj);
}
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

//USING SNIPPETS IN GRADER

function viewSnippets(elId) {
    var index;

    if (!appEditor.grader.snippets.length || (appEditor.grader.snippets.length === 1 && appEditor.grader.snippets[0].snippet === "")) { //placeholder obj.
        displayMsg("v");
        return;
    }
    if (elId !== "gFbWritten") {
        index = (elId).substring(2);
        appEditor.grader.tempRecord.tempCommentElement = "gk" + index;
    } else {
        appEditor.grader.tempRecord.tempCommentElement = elId;
    }
    hideEl("userInput");
    showEl("viewgSnppts");
}
function viewSnippetsForTextA() { //textApaste
    viewSnippets("gFbWritten");
}
function pasteSnippetToDiv(str) {
    var targetEl = appEditor.grader.tempRecord.tempCommentElement;

    if (targetEl !== "") { docEl(targetEl).textContent += " " + str; }
}
function pasteSnippetOnSave(index) {
    var sourceEl = docEl("gx" + index);
    var newText = sourceEl.textContent;

    pasteSnippetToDiv(newText); //adds selected as textContent (target Element is kept in: appEditor.grader.tempRecord.tempCommentElement)
}
//each time a snippet chkbx is checked or unchecked, appEditor.grader.tempRecord.tempSelectedSnippets needs to be updated
//@ identifyGradingSnippet(el)
function isChkdOrNot(elId) {
    var state = docEl(elId).checked;
    var targetIndex = elId.substring(2);  //the index NUMBER as a string
    var removeEl,
        targetId,
        i;

    if (state === true) {
        appEditor.grader.tempRecord.tempSelectedSnippets.push(targetIndex);
    } else {
        removeEl = appEditor.grader.tempRecord.tempSelectedSnippets.indexOf(targetIndex);
        if (removeEl !== - 1) {
            appEditor.grader.tempRecord.tempSelectedSnippets.splice(removeEl, 1);
        }
    }
    for (i = 0; i < appEditor.grader.snippets.length; i++) { //clear all helper numbers
        targetId = "gn" + i;
        docEl(targetId).textContent = "";
    }
    for (i = 0; i < appEditor.grader.tempRecord.tempSelectedSnippets.length; i++) { //update all helper numbers on the UI (next to each chkbx)
        targetId = "gn" + appEditor.grader.tempRecord.tempSelectedSnippets[i]; //the target helper number div
        docEl(targetId).textContent = (i + 1);
    }
}
function reloadSnippets(bool) {
    var i;

    if (bool === true) { //performed only when the save/close button is hit
        //this block loops through the id.s and adds the corresponding snippets to textContent IN THAT ORDER
        var allSectionTags = appEditor.grader.rubric.map(function (el) { return el.sectionName; });
        var targetIndexes = appEditor.grader.tempRecord.tempSelectedSnippets; //["0", "4", "2"...]
        var snipptsToAdd = targetIndexes.length;

        if (allSectionTags.indexOf("any") === -1) {
            allSectionTags.unshift("any");
        }
        for (i = 0; i < snipptsToAdd; i++) {
            pasteSnippetOnSave(targetIndexes[i]);
        }
    }
    setUpToReloadSnippets();
}
function setUpToReloadSnippets() {
    var i;

    appEditor.grader.snippets = appEditor.grader.snippets.sort(function (a, b) { //reads better alphabetically...
        return a.snippet.localeCompare(b.snippet);
    });
    emptyContent(docEl("snpptgContainer"));

    for (i = 0; i < appEditor.grader.snippets.length; i++) {
        createGradingSnippetEl(i, appEditor.grader.snippets[i].snippet);
    }
}
function findIndexInSnippets(rubricName) {
    var index = -1;
    var i;

    if (appEditor.grader.snippets.length) {
        for (i = 0; i < appEditor.grader.snippets.length; i++) {
            if (appEditor.grader.snippets[i].snippetRubric === rubricName) {
                index = i;
                break;
            }
        }
    }
    return index;
}
function startSnippets() {
    var relevant;

    appEditor.grader.snippets = appEditor.snippets.slice(0);

    if (appEditor.grader.noRubricCommentsOnly === true) {
        reloadSnippets(false);
        return;
    }
    if (appEditor.grader.snippets.length) {
        relevant = filterSnippets();
        appEditor.grader.snippets = relevant;
        reloadSnippets(false);
    }
}
function filterSnippets() { //call only AFTER rubric has been defined...@ letsGetStarted()
    var refIndex = findIndexInSnippets(appEditor.grader.tempRecord.rubricRef);
    var anyIndex = findIndexInSnippets("any");
    var snippetData = [];
    var relevant;
    var filtered;
    var anySnippet;
    var result;
    var i;

    //    if (refIndex !== -1 && anyIndex !== -1)  {  return; }
    if (refIndex !== -1) {
        if (anyIndex !== -1) { return; } //appEditor.grader.snippets is already either an empty array (by default) or an array of obj.s

        for (i = appEditor.grader.snippets[refIndex].snippetDef.length - 1; i >= 0; i--) {
            snippetData.push(appEditor.grader.snippets[refIndex].snippetDef[i]);
        }
    }
    if (anyIndex !== -1) {
        for (i = appEditor.grader.snippets[anyIndex].snippetDef.length - 1; i >= 0; i--) {
            snippetData.unshift(appEditor.grader.snippets[anyIndex].snippetDef[i]);
        }
    }

    relevant = appEditor.grader.rubric.map(function (el) { return el.sectionName; });
    filtered = relevant.map(function (elem) {
        return snippetData.filter(function (el, index) {
            return snippetData[index].section.indexOf(elem) !== -1;
        });
    }).reduce(function (prev, current) {
        return prev.concat(current);
    });
    anySnippet = snippetData.filter(function (el) {
        return el.section === "any";
    });
    result = filtered.concat(anySnippet);

    return result;
}
function createTagsForSnippets(snippetIndex) {
    var targetSpan = docEl("gt" + snippetIndex);
    var allSectionTags = ["any"];
    var sectionsRef = appEditor.grader.tempRecord.sectionNames;
    var refLen = sectionsRef.length;
    var targetIndex,
        i;

    for (i = 0; i < refLen; i++) {
        allSectionTags.push(sectionsRef[i]);
    }
    targetIndex = allSectionTags.indexOf(appEditor.grader.snippets[snippetIndex].section);

    if (targetIndex !== -1) {
        targetSpan.textContent = allSectionTags[targetIndex];
    }
}
function exitGradingSnippets() {
    gradingSnippetsExit(false);
}
function pasteAndCloseSnippets() {
    gradingSnippetsExit(true);
}

//UI

function clearActiveMenu() {
    var activeEl = docEl("mainMenu").querySelector("div.btn-primary.active");

    if (activeEl !== null) { activeEl.className = activeEl.className.replace(/(?:^|\s)active(?!\S)/g, ''); }
}
function hideAllEditorViews() {
    clearActiveMenu();
    if (appEditor.editorIsOpen.grader === true) {
        resetGrading(false);
    }
    hideEl("mapContainer");
    hideEl("editRubric");
    hideEl("editFinalRecord");
    hideEl("editStudents");
    hideEl("editSnippets");
    hideEl("components");
    hideEl("editRecordActions");
    hideEl("rubricActions");
    hideEl("snippetActions");
    hideEl("studentActions");
    hideEl("gradeActions");
}
function showEditRecords() {
    if (appEditor.db.records === false) {
        getRecordsIndexFromDb();
    }
    docEl("titleHeader").textContent = "Records";
    showEl("editFinalRecord");

    if (appEditor.editorIsOpen.record === true) {
        showEl("editRecordActions");
    } else {
        showEl("mapContainer");
    }
}
function showEditRubric() {
    if (appEditor.db.rubrics === false) {
        getRubricIndexesFromDb();
    }
    docEl("titleHeader").textContent = "Rubrics";
    showEl("editRubric");

    if (appEditor.editorIsOpen.rubric === true) {
        showEl("rubricActions");
    }
}
function showEditSnippets() {
    if (appEditor.db.snippets === false) {
        getSnippetsFromDb();
    }
    docEl("titleHeader").textContent = "Comment snippets";
    showEl("editSnippets");
    showEl("snippetActions");
}
function showEditStudents() {
    if (appEditor.db.students === false) {
        getStudentsFromDb();
    }
    docEl("titleHeader").textContent = "Current students";
    showEl("editStudents");
    showEl("studentActions");
}
function showGrader() {
    docEl("titleHeader").textContent = "Grade";
    hideEl("gaSctnBoxes");
    //showEl("components");

    if (appEditor.db.rubrics === false || appEditor.db.students === false || appEditor.db.snippets === false) {
        getEverythingGraderNeedsFromDb();
    } else {
        initGrader();
    }
}
function switchForActiveEditorMenu(elId) {
    hideAllEditorViews();
    docEl(elId).className += " active";

    switch (elId) {
        case "leRecords": showEditRecords();
            break;
        case "leStudents": showEditStudents();
            break;
        case "leRubrics": showEditRubric();
            break;
        case "leSnippets": showEditSnippets();
            break;
        case "leGRADER": showGrader();
            break;
        default: return;
    }
}
function identifyElFromMenu(el) {
    if (el.target !== el.currentTarget) {
        if (el.target.nodeName === "SPAN") {
            switchForActiveEditorMenu(el.target.parentElement.id);
        } else if (el.target.nodeName === "DIV") {
            switchForActiveEditorMenu(el.target.id);
        }
        el.stopPropagation();
    }
}
function switchObjForGradingTokens(elId){
    var subStr = (elId).substring(0, 2);

    switch (subStr) {
        case "gj": sectionlock(elId);
        break;
        case "gp": viewSnippets(elId);
        break;
        case "gc": isChkdOrNot(elId);
        break;
        default: return;
    }
}
function identifyGraderEl(el) {
    if (el.target !== el.currentTarget) {
        if (el.target.nodeName !== "SELECT") {
            switchObjForGradingTokens(el.target.id);
        }
        el.stopPropagation();
    }
}
function lockIcon(elId, bool) {
    if (bool === true) {
        docEl(elId).className = docEl(elId).className.replace(/(?:^|\s)icon-lock-open(?!\S)/g, '');
        docEl(elId).className += " icon-lock";
    }
    else {
        docEl(elId).className = docEl(elId).className.replace(/(?:^|\s)icon-lock(?!\S)/g, '');
        docEl(elId).className += " icon-lock-open";
    }
}
function showOrHideSaveBtn(bool) {
    if (bool === true) {
        showEl("gradeActions");
        return;
    }
    hideEl("gradeActions");
}
function displayLockedText(sectionIndex, bool) {
    var text = "";
    var tempScores = appEditor.grader.tempRecord.scores[sectionIndex];
    var critName,
        scoreVal,
        descr,
        i;

    if (bool !== true) {
        hideEl("gv" + sectionIndex);
        return;
    }
    var len = tempScores.length - 1;

    for ( i = 0; i <= len; i++ ) {
        critName = appEditor.grader.rubric[sectionIndex].sectionDef[tempScores[i][1]].criteriaName;
        scoreVal = appEditor.grader.rubric[sectionIndex].sectionDef[tempScores[i][1]].criteriaDef[tempScores[i][2]].score;
        descr = appEditor.grader.rubric[sectionIndex].sectionDef[tempScores[i][1]].criteriaDef[tempScores[i][2]].descriptor;
        text += critName + " " + scoreVal + ":\r\n - " + descr + "\r\n";
    }
    if (appEditor.grader.tempRecord.comments[sectionIndex] !=="") {
        text += "\r\nComment:\r\n - " + appEditor.grader.tempRecord.comments[sectionIndex] + "\r\n";
    }
    docEl("gv" + sectionIndex).textContent = text;
    showEl("gv" + sectionIndex);
}
function identifyChkBox(el) {
    var elId;

    if (el.target !== el.currentTarget) {
        if (el.target.nodeName === "INPUT") { //el.target.nodeName !== "LABEL"
            elId = el.target.id;
            sendChkBoxValToTempRecord(elId);
        }
        el.stopPropagation();
    }
}
function sendChkBoxValToTempRecord(elId) {
    var section = docEl(elId);
    var val = Number(section.value);
    var isChkd = section.checked;

    if (isChkd === true) {
        addSelectedToActiveSectionsArr(val);
    } else if (isChkd === false) {
        removeSelectedFromActiveSectionsArr(val);
    }
}
function showGraderMap(){
    hideEl("userInput");
    showEl("mapgcontainer");
}
function hideGraderMap(){
    hideEl("mapgcontainer");
    showEl("userInput");
}
function findStudentInGradingMap(el) {
    if (el.target !== el.currentTarget) {
        var subStr = (el.target.id).substring(0, 2);

        if (subStr === "gy") {
            selectStudentFromDatasets(el.target.id, false);
        } else if (subStr === "gh") {
            togglegMapContent(el.target.id);
        }
        el.stopPropagation();
    }
}
function togglegMapContent(elId) {
    var targetElId = "gb" + elId.substring(2);
    var isCollapsed = docEl(targetElId).classList.contains("nodisplay");

    if (isCollapsed) {
        docEl(elId).className = docEl(elId).className.replace(/(?:^|\s)collpsd(?!\S)/g, '');
        showEl(targetElId);
    } else {
        docEl(elId).className += " collpsd";
        hideEl(targetElId);
    }
}
function filterCandidatesByClass() {
    var selectBox1 = docEl("chooseClass");
    var targetDiv = docEl("select-styleB");
    var cls = selectBox1.options[selectBox1.selectedIndex].value;

    if (cls !=="") {
        populateStudentsByClass(cls, false);
        targetDiv.className = targetDiv.className.replace(/(?:^|\s)invisible(?!\S)/g, '');
    }
}
function setSelectedFromgMap(cls, sid, nme) { //el.dataset.cls, el.dataset.sid, el.dataset.nme
    var selectBox1 = docEl("chooseClass");
    var selectBox2 = docEl("chooseId");
    var ssId,
        ssName,
        ssCls,
        i;

    for (i= 0; i < selectBox1.options.length; i++) {
        ssCls = selectBox1.options[i].value;

        if (ssCls === cls) {
            selectBox1.options[i].selected = true;
            break;
        }
    }
    populateStudentsByClass(cls, true);

    for (i= 0; i < selectBox2.options.length; i++) {
        ssId = selectBox2.options[i].value;
        ssName = selectBox2.options[i].dataset.nme;

        if (ssId === sid && ssName === nme) {
            selectBox2.options[i].selected = true;
            break;
        }
    }
    setThisCandidate();
    hideGraderMap();
}
function setThisCandidate() {
    var selectBox1 = docEl("chooseClass");
    var selectBox2 = docEl("chooseId");

    appEditor.grader.tempRecord.class = selectBox1.options[selectBox1.selectedIndex].value;
    appEditor.grader.tempRecord.ssId = selectBox2.options[selectBox2.selectedIndex].value;
    appEditor.grader.tempRecord.ssName = selectBox2.options[selectBox2.selectedIndex].dataset.nme;
    docEl("thisgClass").textContent = appEditor.grader.tempRecord.class;
    docEl("thisgStudent").textContent = appEditor.grader.tempRecord.ssId + " " + appEditor.grader.tempRecord.ssName;
    hideEl("studentgSlct");
    showEl("studentgInfo");
}
function resetSingleCandidate() {
    var selectBox2 = docEl("chooseId");
    var targetDiv = docEl("select-styleB");

    if (selectBox2.hasChildNodes("option") === true) {
        selectBox2.options[0].selected = true;
    }
    appEditor.grader.tempRecord.ssId = "";
    appEditor.grader.tempRecord.ssName = "";
    targetDiv.className = targetDiv.className.replace(/(?:^|\s)invisible(?!\S)/g, '');
    docEl("gOvrllScr").value = "";
    hideEl("studentgInfo");
    showEl("studentgSlct");
}
function setContext(val) {
    appEditor.grader.tempRecord.context = val;
    hideEl("ctxContent");
    docEl("ctxContent").value = "";
}
function feContextVal() {
    setContext("Final Exam");
}
function mteContextVal() {
    setContext("Midterm Exam");
}
function hwContextVal() {
    setContext("Homework");
}
function assgnContextVal() {
    setContext("Assignment");
}
function otherContextVal() {
    appEditor.grader.tempRecord.context = docEl("ctxContent").value;
    showEl("ctxContent");
}
function showUserInput() {
    hideEl("components");
    showEl("userInput");
}
function identifyGradingSnippet(el) {
    var elId;

    if (el.target.nodeName !== "LABEL") {
        elId = el.target.id;
        switchObjForGradingTokens(elId);
    }
    el.stopPropagation();
}
function gradingSnippetsExit(bool) {
    hideEl("viewgSnppts");
    reloadSnippets(bool);
    showEl("userInput");
    appEditor.grader.tempRecord.tempSelectedSnippets = []; //clear the array
}
function resetDataEntry() { //don't clear the general feedback for the next student
    var selectEls = docEl("datgEntry").querySelectorAll("select");
    var elId,
        lastSibling,
        i,
        ii;

    selectEls.forEach(function (el) {
        el.selectedIndex = 0;
        lastSibling = el.id.substring(0, (el.id.lastIndexOf("-") + 1)) + "3";
        docEl(lastSibling).textContent = "";
    });
    appEditor.grader.tempRecord.ssId = "";
    appEditor.grader.tempRecord.ssName = "";

    for (i = 0; i < appEditor.grader.tempRecord.scores.length; i++) {
        elId = "gj" + i;
        unlockThisSection(elId, i);
        appEditor.grader.tempRecord.comments[i] = "";
        docEl("gk" + i).textContent = "";

        for (ii = 0; ii < appEditor.grader.tempRecord.scores[i].length; ii++) {
            appEditor.grader.tempRecord.scores[i][ii] = [];
        }
    }
    resetSingleCandidate();
    if (appEditor.grader.noRubricCommentsOnly !== true) { hideEl("gradeActions"); }
}
function chkSetUpToGetStarted() {
    if (docEl("ctxContent").value !=="" && docEl("ctxOther").checked === true) {
        appEditor.grader.tempRecord.context = docEl("ctxContent").value;
    }
    if (appEditor.grader.tempRecord.context === "") {
        displayMsg("w");
        return false;
    }
    if (appEditor.grader.noRubricCommentsOnly === true) { return true; }

    if (appEditor.grader.tempRecord.activeSections.length === 0) {
        displayMsg("x");
        return false;
    }
    return true;
}
function resetGradingFromBtn() { //btn onclick
    resetGrading(true);
}
function resetGrading(bool) {
    appEditor.grader.rubric = [];
    appEditor.grader.loadedRubric = [];
    appEditor.grader.tempRecord.activeSections = [];
    appEditor.grader.noRubricCommentsOnly = false;
    resetSingleCandidate();
    assgnContextVal();
    docEl('ctxAssgn').checked = true;
    docEl("gOvrllScr").value = "";
    docEl("gOvrllMax").value = "";
    docEl('gFbWritten').textContent = "";
    hideEl("gaSctnBoxes");
    hideEl("userInput");
    hideEl("viewgSnppts");
    hideEl("mapgcontainer");
    hideEl("gradeActions");
    hideEl("components");
    docEl("select-styleB").className += " invisible";

    if (appEditor.editorIsOpen.grader === true) {
        gradingHandlersOff();
        appEditor.editorIsOpen.grader = false;
    }
    if (appEditor.editorIsOpen.graderSetup === true) {
        setUpHandlersOff();
        appEditor.editorIsOpen.graderSetup = false;
    }
    emptyContent(docEl("gaCbContainer"));

    if (bool === true) {
        docEl("titleHeader").textContent = "Grade";
        initGrader();
    }
}
function identifyRubricRadio(el) {
    if (el.target !== el.currentTarget) {
        if (el.target.nodeName === "INPUT") { //i.e. el.target.nodeName !== "LABEL"
            if (el.target.id === "_sanz_rubrik") {
                getNoRubricRubric();
                return;
            }
            var idx = (el.target.id).substring(2);

            getSelectedRubric(idx);
        }
        el.stopPropagation();
    }
}
function showSectionsForSelectedRubric(idx) {
    hideEl("gaSctnBoxes");
    appEditor.grader.tempRecord.activeSections = [];

    if (docEl("_sanz_rubrik").checked === true) {
        setUpChkbxSections(false);
        showEl("gaSctnBoxes");
        return;
    }
    if (docEl("gr" + idx).checked !== true) { return; }
   
    appEditor.grader.noRubricCommentsOnly = false;
    appEditor.grader.rubricFilter = [];
    appEditor.grader.rubricFilter = JSON.parse(JSON.stringify(appEditor.grader.loadedRubric[0].rubricDef)); //.slice()
    appEditor.grader.tempRecord.rubricRef = "" + appEditor.grader.loadedRubric[0].rubricName;
    setUpChkbxSections(true);
    showEl("gaSctnBoxes");
}
function identifyGradingSelectopt(el) {
    if (el.target !== el.currentTarget) {
        if (el.target.nodeName === "SELECT") { //onchange Score dropdown: update the relevant descriptor from the accompanying rubric
            updateGradingDescriptorOnScoreChange(el.target.id);
        }
        el.stopPropagation();
    }
}
function letsGetStarted() {
    var canStart = chkSetUpToGetStarted();

    if (canStart !== true) { return; }

    appEditor.editorIsOpen.grader = true;
    appEditor.editorIsOpen.graderSetup = false;
    appEditor.grader.rubric = [];
    showEl("viewRubricDuringGrading");
    hideEl("viewNoRubricOverallScore");

    if (appEditor.grader.noRubricCommentsOnly === true) {
        docEl("gRbChkd").checked = false;
        hideEl("viewRubricDuringGrading");
        showEl("viewNoRubricOverallScore");
        showOrHideSaveBtn(true);
    }
    appEditor.grader.rubric = createSlimRubric();
    defineTempRecord();
    populateGraderUI();
    setUpHandlersOff();
    gradingHandlersOn();
    startSnippets();
    showUserInput();
    populateFullRubric();
}
function viewFullRubric() {
    hideEl("userInput");
    showEl("gaFullRb");
}
function closeFullRubric() {
    hideEl("gaFullRb");
    showEl("userInput");
}
function showMenu() {
    showEl("contentsBox");
    showEl("leRecords");
    showEl("leStudents");
    showEl("leRubrics");
    showEl("leSnippets");
    showEl("leGRADER");
}
function hideMenu() {
    hideEl("contentsBox");
    hideEl("leRecords");
    hideEl("leStudents");
    hideEl("leRubrics");
    hideEl("leSnippets");
    hideEl("leGRADER");
}
function buildTokens(elId, char) {
    var arr = elId.split(char);

    arr = arr.map(function(el) { return Number(el); });
    return arr;
}
function hideEl(elId) {
    if (!docEl(elId).classList.contains('nodisplay')) {
        docEl(elId).className += ' nodisplay';
    }
}
function showEl(elId) {
    docEl(elId).className = docEl(elId).className.replace(/(?:^|\s)nodisplay(?!\S)/g, '');
}
function enableEl(elId) {
    docEl(elId).className = docEl(elId).className.replace( /(?:^|\s)disabledbutton(?!\S)/g , '' );
}
function disableEl(elId) {
    docEl(elId).className += ' disabledbutton';
    window.scrollTo(0, 0);
}
function initGrader() { //a default "No rubric" rubric (comments only) is set @loadGraderRubriks()
    if (appEditor.db.students === false) { return; }
    if (!appEditor.studentData.length || (appEditor.studentData.length === 1 && appEditor.studentData[0].stCls === "")) { //placeholder obj.
        hideEl("components");
        displayMsg("c", "No student data was found.");
        return;
    }
    showEl("components");
    showEl("gaLoading");
    loadGraderRubriks();
}
function finishInit() {
    buildStudentgMap();
    populateAllgClassesSelectBox();
}
function resetUiAfterDwnld(elId) {
    toggleAllRecordChkBoxesOff();
    docEl(elId).className = docEl(elId).className.replace(/(?:^|\s)invisible(?!\S)/g, '');
}
function tableClick(e) {
    var elClssName;

    if (e.target !== e.currentTarget) {
        elClssName = e.target.className;

        switch (elClssName) {
            case "criterias": rowName(e);
                break;
            case "dropbtn": rowDown(e);
                break;
            case "row-insert-top": rowTop(e);
                break;
            case "row-insert-bottom": rowBtm(e);
                break;
            case "row-delete": rowDel(e);
                break;
            default: return;
        }
    }
    //e.stopPropagation();
}
function headersClick(e) {
    var elClssName;

    if (e.target !== e.currentTarget) {
        elClssName = e.target.className;

        switch (elClssName) {
            case "dropbtn": colDown(e);
                break;
            case "col-insert-left": colLeft(e);
                break;
            case "col-insert-right": colRight(e);
                break;
            case "col-delete": colDel(e);
                break;
            default: return;
        }
    }
    //e.stopPropagation();
}
function resetBtn(e) {
    var indices = (e.target.id).split("-");

    switch (indices[0]) {
        case "hk": resetRenameOk(indices);
            break;
        case "hz": resetRenameExit(indices);
            break;
        case "hs": resetReset(indices);
            break;
        case "hd": resetDelete(indices);
            break;
        default: return;
    }
    e.stopPropagation();
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

//HANDLERS
function oneClickAndRemoveHandler() {
    docEl("mainMenu").removeEventListener("click", oneClickAndRemoveHandler, { capture: false, passive: true });
    emptyContent(docEl("welcomeMsg"));
}
function rubrikHandlersOn() {
    docEl("newRubrikSectionBtn").addEventListener("click", initNewSectionFromNew, { capture: false, passive: true });
    docEl("editRubric").addEventListener("click", closeDropBtn, { capture: false, passive: true });
    docEl("ruCreateNew").addEventListener("click", newRubrik, { capture: false, passive: true });
    docEl("ac_ru_commit").addEventListener("click", commitRubrik, { capture: false, passive: true });
    docEl("ac_ru_dis").addEventListener("click", discardRubrik, { capture: false, passive: true });
    docEl("ruLoadSelected").addEventListener("click", selectLoadedRubrik, { capture: false, passive: true });
    docEl("ac_ru_del").addEventListener("click", destroyRubrik, { capture: false, passive: true });
    docEl("rubrik").addEventListener("paste", getPaste, false);
}
function studentInfoHandlersOn() {
    docEl("ac_st_add").addEventListener("click", addNewStudent, { capture: false, passive: true });
    docEl("ac_st_exit").addEventListener("click", exitUpdatedStudents, { capture: false, passive: true });
    docEl("ac_st_save").addEventListener("click", saveUpdatedStudents, { capture: false, passive: true });
    docEl("editStudents_table").addEventListener("click", identifyStudentInfoEl, { capture: false, passive: true });
    docEl("studentfile").addEventListener('change', handleStudentsCSV, { capture: false, passive: true });
    docEl("ac_st_reset").addEventListener('click', resetStudents, { capture: false, passive: true });
    docEl("editStudents_table").addEventListener("paste", getPaste, false);
}
function snippetHandlersOn() {
    docEl("snptsTbd").addEventListener("click", identifySnippet, { capture: false, passive: true });
    docEl("ac_sn_save").addEventListener("click", saveChangesToSnippets, { capture: false, passive: true });
    docEl("ac_sn_add").addEventListener("click", addNewSnippet, { capture: false, passive: true });
    docEl("ac_sn_dis").addEventListener("click", coldExitSnippets, { capture: false, passive: true });
    docEl("snptsTbd").addEventListener("paste", getPaste, false);
}
function recordsHandlersOn() {
    docEl("recordsContainer").addEventListener("change", identifySelectopt, { capture: false, passive: true });
    docEl("recordsContainer").addEventListener("click", identifyEditRecordEl, { capture: false, passive: true });
    docEl("ac_re_update").addEventListener("click", chkAllRecordsBeforeUpdate, { capture: false, passive: true });
    docEl("ac_re_exit").addEventListener("click", exitUpdateRecords, { capture: false, passive: true });
    docEl("recordsMap").addEventListener("click", findStudentInRecordsMap, { capture: false, passive: true });
    docEl("showmap").addEventListener("click", exitUpdateRecords, { capture: false, passive: true });
    docEl("recordsContainer").addEventListener("paste", getPaste, false);
}
function setUpHandlersOn() {
    docEl("catsSet").addEventListener("click", letsGetStarted, { capture: false, passive: true });
    docEl("ctxFe").addEventListener("click", feContextVal, { capture: false, passive: true });
    docEl("ctxMte").addEventListener("click", mteContextVal, { capture: false, passive: true });
    docEl("ctxHw").addEventListener("click", hwContextVal, { capture: false, passive: true });
    docEl("ctxAssgn").addEventListener("click", assgnContextVal, { capture: false, passive: true });
    docEl("ctxOther").addEventListener("click", otherContextVal, { capture: false, passive: true });
    docEl("gaCbContainer").addEventListener("click", identifyChkBox, { capture: false, passive: true });
    docEl("gaLoadChkBoxes").addEventListener("click", identifyRubricRadio, { capture: false, passive: true });
}
function setUpHandlersOff() {
    docEl("catsSet").removeEventListener("click", letsGetStarted, { capture: false, passive: true });
    docEl("ctxFe").removeEventListener("click", feContextVal, { capture: false, passive: true });
    docEl("ctxMte").removeEventListener("click", mteContextVal, { capture: false, passive: true });
    docEl("ctxHw").removeEventListener("click", hwContextVal, { capture: false, passive: true });
    docEl("ctxAssgn").removeEventListener("click", assgnContextVal, { capture: false, passive: true });
    docEl("ctxOther").removeEventListener("click", otherContextVal, { capture: false, passive: true });
    docEl("gaCbContainer").removeEventListener("click", identifyChkBox, { capture: false, passive: true });
    docEl("gaLoadChkBoxes").removeEventListener("click", identifyRubricRadio, { capture: false, passive: true });
}
function gradingHandlersOn() {
    docEl("datgEntry").addEventListener("change", identifyGradingSelectopt, { capture: false, passive: true });
    docEl("datgEntry").addEventListener("click", identifyGraderEl, { capture: false, passive: true });
    docEl('chooseClass').addEventListener('change', filterCandidatesByClass, { capture: false, passive: true });
    docEl('chooseId').addEventListener('change', setThisCandidate, { capture: false, passive: true });
    docEl('resetStudent').addEventListener('click', resetSingleCandidate, { capture: false, passive: true });
    docEl("ac_gr_save").addEventListener('click', commitNewRecord, { capture: false, passive: true });
    docEl("ac_gr_dl").addEventListener('click', dlNewRecordAndSave, { capture: false, passive: true });
    docEl('mgap').addEventListener('click', findStudentInGradingMap, { capture: false, passive: true });
    docEl('showgMap').addEventListener('click', showGraderMap, { capture: false, passive: true });
    docEl('snpptgContainer').addEventListener("click", identifyGradingSnippet, { capture: false, passive: true });
    docEl('textApaste').addEventListener("click", viewSnippetsForTextA, { capture: false, passive: true });
    docEl('snpptgSave').addEventListener("click", pasteAndCloseSnippets, { capture: false, passive: true });
    docEl('snpptgExit').addEventListener("click", exitGradingSnippets, { capture: false, passive: true });
    docEl('resetGrader').addEventListener("click", resetGradingFromBtn, { capture: false, passive: true });
    docEl("userInput").addEventListener("paste", getPaste, false);
    docEl("gaRbAttchd").addEventListener("click", viewFullRubric, { capture: false, passive: true });
    docEl("closeGaRbAttchd").addEventListener("click", closeFullRubric, { capture: false, passive: true });
}
function gradingHandlersOff() {
    docEl("datgEntry").removeEventListener("change", identifyGradingSelectopt, { capture: false, passive: true });
    docEl("datgEntry").removeEventListener("click", identifyGraderEl, { capture: false, passive: true });
    docEl('chooseClass').removeEventListener('change', filterCandidatesByClass, { capture: false, passive: true });
    docEl('chooseId').removeEventListener('change', setThisCandidate, { capture: false, passive: true });
    docEl('resetStudent').removeEventListener('click', resetSingleCandidate, { capture: false, passive: true });
    docEl("ac_gr_save").removeEventListener('click', commitNewRecord, { capture: false, passive: true });
    docEl("ac_gr_dl").removeEventListener('click', dlNewRecordAndSave, { capture: false, passive: true });
    docEl('mgap').removeEventListener('click', findStudentInGradingMap, { capture: false, passive: true });
    docEl('showgMap').removeEventListener('click', showGraderMap, { capture: false, passive: true });
    docEl('snpptgContainer').removeEventListener("click", identifyGradingSnippet, { capture: false, passive: true });
    docEl('textApaste').removeEventListener("click", viewSnippetsForTextA, { capture: false, passive: true });
    docEl('snpptgSave').removeEventListener("click", pasteAndCloseSnippets, { capture: false, passive: true });
    docEl('snpptgExit').removeEventListener("click", exitGradingSnippets, { capture: false, passive: true });
    docEl('resetGrader').removeEventListener("click", resetGradingFromBtn, { capture: false, passive: true });
    docEl("userInput").removeEventListener("paste", getPaste, false);
    docEl("gaRbAttchd").removeEventListener("click", viewFullRubric, { capture: false, passive: true });
    docEl("closeGaRbAttchd").removeEventListener("click", closeFullRubric, { capture: false, passive: true });
}
function newRubrikHandlersOn() {
    docEl("ruNewSaveBtn").addEventListener("click", initNewRubrik, { capture: false, passive: true });
    docEl("ruNewExitBtn").addEventListener("click", coldExitNewRubrik, { capture: false, passive: true });
}
function newRubrikHandlersOffAndExit() {
    hideEl("ruNewRubricName");
    docEl("ruNewSaveBtn").removeEventListener("click", initNewRubrik, { capture: false, passive: true });
    docEl("ruNewExitBtn").removeEventListener("click", coldExitNewRubrik, { capture: false, passive: true });
}
function initNewSection(val, bool) {
    var isDup = bool;
    var htmlId;

    if (isDup === true) {
        displayMsg("g");
        return;
    } else if (val !== "" && isDup === false) {
        htmlId = getKeyGivenValue(appEditor.table_lookup, val);
        createNewSectionTable(htmlId);
        createSpreadsheet(true);
        docEl("hs-" + htmlId).addEventListener("click", resetBtn);
        docEl("hd-" + htmlId).addEventListener("click", resetBtn);
        docEl("hk-" + htmlId).addEventListener("click", resetBtn);
        docEl("hz-" + htmlId).addEventListener("click", resetBtn);
    }
    docEl("newRubrikSection").value = "";
}
function removeOldListeners(tableId) {
    var tableHeaders = docEl("table-headers-" + tableId);
    var tableBody = docEl("table-body-" + tableId);

    if (tableBody !== null) {
        tableBody.removeEventListener("focusout", tableFocus);
        tableBody.removeEventListener("click", tableClick);
    }
    if (tableHeaders !== null) {
        tableHeaders.removeEventListener("click", headersClick);
    }
}
function deleteSection(tableId) {
    var tableForDeletion = docEl("table-headers-" + tableId).parentNode;
    var tableBody = docEl("table-body-" + tableId);
    var tableHeaders = docEl("table-headers-" + tableId);
    var resetbutton = docEl("hs-" + tableId);
    var deletebutton = docEl("hd-" + tableId);
    var renameOkbtn = docEl("hk-" + tableId);
    var renameExitbtn = docEl("hz-" + tableId);
    var renameSection = docEl("hn" + tableId);

    appEditor.table_Id = "";
    tableBody.removeEventListener("focusout", tableFocus);
    tableBody.removeEventListener("click", tableClick);
    tableHeaders.removeEventListener("click", headersClick);
    resetbutton.removeEventListener("click", resetBtn);
    deletebutton.removeEventListener("click", deletebutton);
    renameOkbtn.removeEventListener("click", renameOkbtn);
    renameExitbtn.removeEventListener("click", renameExitbtn);

    emptyContent(tableForDeletion);

    tableForDeletion.parentNode.removeChild(tableForDeletion);
    resetbutton.parentNode.removeChild(resetbutton);
    deletebutton.parentNode.removeChild(deletebutton);
    renameOkbtn.parentNode.removeChild(renameOkbtn);
    renameExitbtn.parentNode.removeChild(renameExitbtn);
    renameSection.parentNode.removeChild(renameSection);

    delete appEditor.tableObj[tableId];
    delete appEditor.table_lookup[tableId];
}
function createSpreadsheet(bool) {
    var tableId = "" + appEditor.table_Id;
    var spreadsheetData,
        defaultRowCount,
        defaultColCount,
        tableHeaderElement,
        tableBodyElement,
        tableBody,
        tableHeaders;

    if (bool === false) { removeOldListeners(tableId); }
    spreadsheetData = getData();
    defaultRowCount = spreadsheetData.length - 1;
    defaultColCount = spreadsheetData[0].length - 1;
    tableHeaderElement = docEl("table-headers-" + tableId);
    tableBodyElement = docEl("table-body-" + tableId);
    tableBody = tableBodyElement.cloneNode(true);
    tableBodyElement.parentNode.replaceChild(tableBody, tableBodyElement);
    tableHeaders = tableHeaderElement.cloneNode(true);
    tableHeaderElement.parentNode.replaceChild(tableHeaders, tableHeaderElement);

    emptyContent(tableHeaders);
    emptyContent(tableBody);

    tableHeaders.appendChild(createHeaderRow(defaultColCount));

    createTableBody(tableBody, defaultRowCount, defaultColCount);
    populateTable();

    tableBody.addEventListener("focusout", tableFocus);
    tableBody.addEventListener("click", tableClick);
    tableHeaders.addEventListener("click", headersClick);
    docEl("hr-1-1-" + appEditor.table_Id).textContent = appEditor.table_lookup[tableId];
}

//DOM PUNCHING

function createStudentEl(studentIndex, referenceObj) {
    let container = document.getElementById("editStudents_body");
    let frag = document.createDocumentFragment();
    let content = frag_createStudentEl(studentIndex, referenceObj); //@domFrags

    frag.appendChild(content);
    container.appendChild(frag);
}
function createSnippetEl(objIndex, snptIndex, txt) {
    let container = docEl("snptsTbd");
    let frag = document.createDocumentFragment();
    let content = frag_createSnippetEl(objIndex, snptIndex, txt); //@domFrags

    frag.appendChild(content);
    container.appendChild(frag);
}
function createFinalRecordElForNoRubric(recordIndex) {
    const record = appEditor.appEditRecords.tempStudentRecords[recordIndex];
    const dateTime = new Date(record.timeStamp).toLocaleString();
    const score = record.noRubricScore;
    const ctx = record.context;
    let container = docEl("recordsContainer");
    let frag = document.createDocumentFragment();
    let content1 = frag_createFinalRecordElForNoRubricPt1(recordIndex, dateTime, score, ctx); //@domFrags
    let content2 = frag_createFinalRecordElForNoRubricPt2(recordIndex, dateTime, ctx); //@domFrags

    frag.appendChild(content1);
    frag.appendChild(content2);
    container.appendChild(frag);
    setRecordFeedbck(recordIndex);
}
function createFinalRecordEl(recordIndex) {
    const record = appEditor.appEditRecords.tempStudentRecords[recordIndex];
    const dateTime = new Date(record.timeStamp).toLocaleString();
    const fdbck = record.feedback.rubricChkd;
    const ctx = record.context;
    let container = docEl("recordsContainer");
    let frag = document.createDocumentFragment();
    let content1 = frag_createFinalRecordElPt1(recordIndex, dateTime, fdbck, ctx); //@domFrags
    let content2 = frag_createFinalRecordElPt2(recordIndex, dateTime, ctx); //@domFrags

    frag.appendChild(content1);
    frag.appendChild(content2);
    container.appendChild(frag);
}
function createFinalRecordSectionEl(recordIndex, sectionName, sectionIndex) {
    let container = docEl("fuSection" + recordIndex);
    let frag = document.createDocumentFragment();
    let content = frag_createFinalRecordSectionEl(recordIndex, sectionName, sectionIndex); //@domFrags

    frag.appendChild(content);
    container.appendChild(frag);
}
function createFinalRecordCriteriasEl(recordIndex, sectionIndex) { //creates one row (tr) for each criteria of a section
    const refObj = appEditor.appEditRecords.tempStudentRecords[recordIndex];
    const allCriterias = refObj.scores[sectionIndex];
    const fdbck = refObj.feedback.rubric[sectionIndex];
    const comments = refObj.comments[sectionIndex];
    let container = docEl("ff" + recordIndex + "-" + sectionIndex);
    let frag = document.createDocumentFragment();
    let content = frag_createFinalRecordCriteriasEl(recordIndex, sectionIndex, allCriterias, fdbck, comments);

    frag.appendChild(content);
    container.appendChild(frag);
}
function createFinalRecord() {
    var rubricChkd = docEl("gRbChkd").checked;
    var finalRecord = {};
    var recordVal,
        genScore,
        i,
        ii;

    finalRecord.timeStamp = Date.now();
    finalRecord.context = appEditor.grader.tempRecord.context;
    finalRecord.feedback = {};
    finalRecord.feedback.written = appEditor.grader.tempRecord.feedback.written;
    finalRecord.feedback.rubric = appEditor.grader.rubric;
    finalRecord.feedback.rubricChkd = rubricChkd;
    finalRecord.studentData = {};
    finalRecord.studentData.stCls = appEditor.grader.tempRecord.class;
    finalRecord.studentData.stId = appEditor.grader.tempRecord.ssId;
    finalRecord.studentData.stNme = appEditor.grader.tempRecord.ssName;

    if (appEditor.grader.noRubricCommentsOnly === true) {
        finalRecord.noRubric = true;
        finalRecord.noRubricScore = {};
        genScore = getGenScoreForNoRubric("gOvrllScr", "gOvrllMax");
        finalRecord.noRubricScore.scr = genScore[0];
        finalRecord.noRubricScore.max = genScore[1];
        return finalRecord;
    }
    finalRecord.comments = [];
    finalRecord.sectionNames = [];
    finalRecord.scores = [];
    finalRecord.sectionNames = appEditor.grader.tempRecord.sectionNames;

    for ( i = 0; i < appEditor.grader.tempRecord.scores.length; i++ ) {
        finalRecord.comments.push(appEditor.grader.tempRecord.comments[i]);
        finalRecord.scores.push([]);

        for ( ii = 0; ii < appEditor.grader.tempRecord.scores[i].length; ii++ ) {
            recordVal = getTempRecordVariables(i, ii);
            finalRecord.scores[i].push([]);
            finalRecord.scores[i][ii].push(recordVal.criteria);
            finalRecord.scores[i][ii].push(recordVal.score);
            finalRecord.scores[i][ii].push(recordVal.maxScore); //@findMaxScore
            finalRecord.scores[i][ii].push(recordVal.descriptor);
        }
    }
    return finalRecord;
}
function buildStudentgMap() {
    const clsses = allgClasses();
    const len = clsses.length;
    let frag = document.createDocumentFragment();
    let container = docEl("mgap");
    let stdnts,
        stdntsLen,
        i,
        ii;

    emptyContent(container);

    for (i = 0; i < len; i++) {
        let clss = clsses[i];
        let newDiv1 = document.createElement("div");
        let newDiv2 = document.createElement("div");

        newDiv1.id = "gh" + i;
        newDiv1.textContent = "Class: " + clss;
        newDiv1.className = "mapClass";
        stdnts = getgCandidatesByClass(clss);
        stdntsLen = stdnts.length;

        for (ii = 0; ii < stdntsLen; ii++) {
            let newBtn1 = frag_buildStudentgMapNewBtn(clss, stdnts[ii][0], stdnts[ii][1]);            
            
            newDiv2.appendChild(newBtn1);
        }
        newDiv2.id = "gb" + i;
        frag.appendChild(newDiv1);
        frag.appendChild(newDiv2);
    }
    container.appendChild(frag);
}
function populateAllgClassesSelectBox() {
    const clsses = allgClasses();
    const len = clsses.length;
    let selectId = docEl("chooseClass");
    let frag = document.createDocumentFragment();
    let newOpt0 = document.createElement("option");
    let i;

    newOpt0.value = "";
    newOpt0.textContent = "Class";
    frag.appendChild(newOpt0);

    for (i = 0; i < len; i++) {
        let newOpt1 = document.createElement("option");

        newOpt1.value = clsses[i];
        newOpt1.textContent = clsses[i];
        frag.appendChild(newOpt1);
    }
    emptyContent(selectId);
    selectId.appendChild(frag);
    selectId.firstChild.setAttribute("disabled", true);
    selectId.firstChild.setAttribute("selected", true);
}
function populateStudentsByClass(clss, bool) {
    const stdnts = getgCandidatesByClass(clss);
    const len = stdnts.length;
    let selectId = docEl("chooseId");
    let frag = document.createDocumentFragment();
    let newOpt0 = document.createElement("option");
    let i;

    newOpt0.value = "";
    newOpt0.dataset.nme = "";
    newOpt0.textContent = "Student";
    frag.appendChild(newOpt0);

    for (i = 0; i < len; i++) {
        let newOpt1 = document.createElement("option");

        newOpt1.value = stdnts[i][0];
        newOpt1.dataset.nme = stdnts[i][1];
        newOpt1.textContent = stdnts[i][0] + " " + stdnts[i][1];
        frag.appendChild(newOpt1);
    }
    emptyContent(selectId);
    selectId.appendChild(frag);
    selectId.firstChild.setAttribute("disabled", true);

    if (bool === false) { selectId.firstChild.setAttribute("selected", true); }
}
function createGradingSnippetEl(snippetIndex, txt) {
    let container = docEl("snpptgContainer");
    let frag = document.createDocumentFragment();
    let content = frag_createGradingSnippetEl(snippetIndex, txt);

    frag.appendChild(content);
    container.appendChild(frag);
    createTagsForSnippets(snippetIndex);
}
function createGradingRubriksButtons(rubrikKey, rubrikName) {
    var container = docEl("gaLoadChkBoxes"); //fieldset
    var frag = document.createDocumentFragment();
    var newInput = document.createElement("input");
    var newLabel = document.createElement("label");

    newInput.id = "gr" + rubrikKey;
    newInput.value = rubrikName;
    newInput.name = "scalot";
    newInput.type = "radio";
    newLabel.htmlFor = "gr" + rubrikKey;
    newLabel.textContent = rubrikName;

    frag.appendChild(newInput);
    frag.appendChild(newLabel);
    container.appendChild(frag);
}
function createNoRubricGradingRubrikButton() {
    var container = docEl("gaLoadChkBoxes"); //fieldset
    var frag = document.createDocumentFragment();
    var newInput = document.createElement("input");
    var newLabel = document.createElement("label");

    newInput.id = "_sanz_rubrik";
    newInput.value = "No rubric";
    newInput.name = "scalot";
    newInput.type = "radio";
    newLabel.htmlFor = "_sanz_rubrik";
    newLabel.textContent = "No rubric";

    frag.appendChild(newInput);
    frag.appendChild(newLabel);
    container.appendChild(frag);
}
function setUpChkbxSections(bool) {
    var frag,
        allSectionNames,
        i;

    docEl("gaSctnTextHelper").textContent = "";
    emptyContent(docEl('gaCbContainer'));

    if (bool !== true) { return; }

    frag = document.createDocumentFragment();
    allSectionNames = getSectionNames(appEditor.grader.rubricFilter);
    len = allSectionNames.length;

    for (i = 0; i < len; i++) {
        let newDiv1 = frag_setUpChkbxSections(i, allSectionNames[i]);

        frag.appendChild(newDiv1);
    }
    docEl("gaSctnTextHelper").textContent = "...and the sections to use (in order):";
    docEl('gaCbContainer').appendChild(frag);
}
function createGradingCriteriasEl(sectionIndex) { //creates one row (tr) for each criteria of a section
    const allCriterias = appEditor.grader.rubric[sectionIndex].sectionDef;
    const allCriteriasLength = allCriterias.length;
    let container = docEl("gf" + sectionIndex);
    let frag = document.createDocumentFragment();
    let newTr2 = document.createElement("tr"); //the section comment...
    let newTd6 = document.createElement("td");
    let newTd7 = document.createElement("td");
    let newPasteSpan = document.createElement("span");
    let i,
        ii;

    for (i = 0; i < allCriteriasLength; i++) {
        let newTr = frag_createGradingCriteriasEl(sectionIndex, i, allCriterias[i]);
        
        frag.appendChild(newTr);
    }
    newTd6.textContent = "Comment:";
    newPasteSpan.id = "gp" + sectionIndex;
    newPasteSpan.className = "icon-paste pasteBtn";
    newTd7.id = "gk" + sectionIndex;
    newTd7.contentEditable = "true";
    newTd7.textContent = "";
    newTd7.colSpan = "3";

    newTd6.appendChild(newPasteSpan);
    newTr2.appendChild(newTd6);
    newTr2.appendChild(newTd7);
    frag.appendChild(newTr2);
    container.appendChild(frag);
}
function createSectionElTables(i) {
    let container = docEl("gq" + i);
    let frag = document.createDocumentFragment();
    let content = frag_createSectionElTables(i);

    frag.appendChild(content);
    container.appendChild(frag);
}
function createUISections() {
    const len = appEditor.grader.rubric.length;
    let container = docEl('datgEntry');
    let frag = document.createDocumentFragment();
    let i;

    emptyContent(docEl('datgEntry'));

    for (i = 0; i < len; i++) { //each section wrapper
        let sectionName = appEditor.grader.rubric[i].sectionName;
        let newDiv4 = frag_createUISections(i, sectionName);
        
        frag.appendChild(newDiv4);
    }
    container.appendChild(frag);
}
//TODO: a tricky refactor...
function populateFullRubric() {
    var numOfTables = appEditor.grader.rubric.length;
    var container = docEl("gaFullRbContainer");
    var frag = document.createDocumentFragment();
    var numOfRows,
        numOfCells,
        i,
        ii,
        iii;

    emptyContent(container);

    for (i = 0; i < numOfTables; i++) {
        var newTable = document.createElement("table");
        var newThead = document.createElement("thead");
        var newHeadTr = document.createElement("tr");
        var newTbody = document.createElement("tbody");
        var isRowStart;
        var isFirstRow;
        var isColStart;

        newTable.className = "table table-responsive table-striped table-bordered table-condensed";
        numOfRows = appEditor.grader.rubric[i].sectionDef.length;
        isRowStart = true;
        isFirstRow = true;

        for (ii = 0; ii < numOfRows; ii++) { //header row
            numOfCells = appEditor.grader.rubric[i].sectionDef[ii].criteriaDef.length;

            for (iii = 0; iii < numOfCells; iii++) {
                var newTh = document.createElement("th");

                if (isFirstRow === true) { //define the first row
                    if (isRowStart === true) {
                        var newCol1Th = document.createElement("th");

                        newCol1Th.textContent = appEditor.grader.rubric[i].sectionName;
                        newHeadTr.appendChild(newCol1Th);
                        isRowStart = false;
                    }
                    newTh.textContent = appEditor.grader.rubric[i].sectionDef[ii].criteriaDef[iii].score;
                    newHeadTr.appendChild(newTh);
                }
            }
            isFirstRow = false;
        }
        newThead.appendChild(newHeadTr);

        for (ii = 0; ii < numOfRows; ii++) { //body
            var newTr = document.createElement("tr");

            numOfCells = appEditor.grader.rubric[i].sectionDef[ii].criteriaDef.length;
            isColStart = true;

            for (iii = 0; iii < numOfCells; iii++) {
                var newTd = document.createElement("td");

                if (isColStart === true) { //define the first cell (criteria name)
                    var newCol1 = document.createElement("td");

                    newCol1.textContent = appEditor.grader.rubric[i].sectionDef[ii].criteriaName;
                    newTr.appendChild(newCol1);
                    isColStart = false;
                }
                newTd.textContent = appEditor.grader.rubric[i].sectionDef[ii].criteriaDef[iii].descriptor;
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
function createAvailableRubriksButtons(rubrikNameKey) {
    var container = docEl("ruLoadChkBoxes"); //fieldset
    var frag = document.createDocumentFragment();
    var newInput = document.createElement("input");
    var newLabel = document.createElement("label");

    newInput.id = "ruSelect_" + rubrikNameKey;
    newInput.value = rubrikNameKey;
    newInput.name = "scalor";
    newInput.type = "radio";
    newLabel.htmlFor = "ruSelect_" + rubrikNameKey;
    newLabel.textContent = appEditor.rubricsIndex[rubrikNameKey].rubricName;

    frag.appendChild(newInput);
    frag.appendChild(newLabel);
    container.appendChild(frag);
}
function createAvailableRubriksDivider() {
    var container = docEl("ruLoadChkBoxes"); //fieldset
    var frag = document.createDocumentFragment();
    var newDiv0 = document.createElement("DIV");

    newDiv0.className = "rubricsDivider";

    frag.appendChild(newDiv0);
    container.appendChild(frag);
}
//TODO: refactor and keep @main.js:
function buildRecordsMap() {
    var clsses = allClasses();
    var frag = document.createDocumentFragment();
    var container = docEl("recordsMap");
    var stdnts;
    var aStdntRecords;
    var i;
    var ii;
    var iii;

    emptyContent(container);

    for (i = 0; i < clsses.length; i++) {
        var newDiv1 = document.createElement("div");
        var newDiv2 = document.createElement("div");
        var newTable1 = document.createElement("table");
        var newTbody1 = document.createElement("tbody");
        var newSpan0 = document.createElement("span");
        var newDelSpan = document.createElement("span");
        var newDlSpan = document.createElement("span");

        newSpan0.id = "jq" + i;
        newSpan0.className = "label label-md";
        newSpan0.style.fontWeight = 400;
        newSpan0.textContent = "Select all / none";
        newDelSpan.id = "jz" + i;
        newDelSpan.className = "btn btn-xs btn-dangerous destroyRecord pull-right";
        newDelSpan.style.marginLeft = 5 + "px";
        newDelSpan.textContent = "Delete selected";
        newDlSpan.id = "jx" + i;
        newDlSpan.className = "btn btn-xs btn-default pull-right";
        newDlSpan.textContent = "Download selected";
        newDlSpan.style.paddingLeft = 5 + "px";
        newDlSpan.style.paddingRight = 5 + "px";
        newDiv1.id = "jh" + i;
        newDiv1.className = "mapClass";
        newDiv1.textContent = "Class: " + clsses[i] + " ";
        newDiv2.id = "jm" + i;
        newTable1.className = "table small noBtmMargin";
        newTbody1.id = "jb" + i;

        stdnts = getCandidatesByClass(clsses[i]); //[["21526737","김채영"],["21526494","박주희"],...]

        for (ii = 0; ii < stdnts.length; ii++) {
            var newTr1 = document.createElement("tr");
            var newTd1 = document.createElement("td");
            var newDiv3 = document.createElement("div");

            newDiv3.id = "jy" + i + "-" + ii;
            newDiv3.dataset.cls = clsses[i];
            newDiv3.dataset.sid = stdnts[ii][0];
            newDiv3.dataset.nme = stdnts[ii][1];
            newDiv3.className = "btn btn-sm btn-whiteBlue";
            newDiv3.style.margin = 1 + "px";
            newDiv3.textContent = "Edit";
            newTr1.className = "striped";
            newTd1.appendChild(newDiv3);
            newTr1.appendChild(newTd1);

            aStdntRecords = getOneSetOfRecords(stdnts[ii][0],stdnts[ii][1], clsses[i]); //id, name, class

            if (!aStdntRecords.length) {
                continue; //ignore unfound records...
            } else {
                var newTd3 = document.createElement("td");
                var newSpan2 = document.createElement("span");

                newSpan2.id = "jw" + i + "-" + ii;
                newSpan2.dataset.cls = clsses[i];
                newSpan2.dataset.sid = stdnts[ii][0];
                newSpan2.dataset.nme = stdnts[ii][1];
                newSpan2.className = "label label-md";
                newSpan2.dataset.slct = "all";
                newSpan2.textContent = stdnts[ii][0] + " " + stdnts[ii][1]; //"Select all"
                newTd3.className = "tdSelectBtn";
                newTd3.appendChild(newSpan2);
                newTr1.appendChild(newTd3);

                for (iii = 0; iii < aStdntRecords.length; iii++) { //i: is the class, ii: is the student, iii: is the record
                    var recordDate = new Date(aStdntRecords[iii].timeStamp).toLocaleDateString();
                    var newTd2 = document.createElement("td");
                    var newDiv4 = document.createElement("div");
                    var newInput1 = document.createElement("input");
                    var newLabel1 = document.createElement("label");
                    var newSpan1 = document.createElement("span");
                    var recordId = "jk" + aStdntRecords[iii].recordKey;

                    newDiv4.className = "squaredFour compacted";
                    newInput1.type = "checkbox";
                    newInput1.id = recordId;
                    newInput1.className = "targeted";
                    newLabel1.htmlFor = recordId;
                    newSpan1.textContent = " " + aStdntRecords[iii].context + "\n" + recordDate;
                    newDiv4.appendChild(newInput1);
                    newDiv4.appendChild(newLabel1);
                    newTd2.appendChild(newDiv4);
                    newTd2.appendChild(newSpan1);
                    newTr1.appendChild(newTd2);
                }
                newTbody1.appendChild(newTr1);
            }
        }
        newDiv1.appendChild(newSpan0);
        newDiv1.appendChild(newDelSpan);
        newDiv1.appendChild(newDlSpan);
        newTable1.appendChild(newTbody1);
        newDiv2.appendChild(newTable1);
        frag.appendChild(newDiv1);
        frag.appendChild(newDiv2);
    }
    container.appendChild(frag);
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

// INIT

function initSuccess() {
    const msg = "Hello !";
    splashScreen(false, msg);

    docEl("mainMenu").addEventListener("click", oneClickAndRemoveHandler, {capture:false, passive: true});
    docEl("mainMenu").addEventListener("click", identifyElFromMenu, {capture:false, passive: true});
    showMenu();
}

function splashScreen(isSignedOut, msg) {
    const msgEltxt = docEl("welcomeMsg");

    if (!isSignedOut) {
        msgEltxt.textContent = "";
        hideEl("welcomeMsg");
        return;
    }
    hideMenu();
    resetAppEditor();
    hideAllEditorViews();
    
    msgEltxt.textContent = msg;
    showEl("welcomeMsg");
    try {
        handlersOff();
    } catch(e) {
        return;
    }
}

function resetAppEditor() {
    appEditor.editorIsOpen = { record: false, rubric: false, grader: false },
    appEditor.db = { records: false, rubrics: false, students: false, snippets: false },
    appEditor.recordsIndex = [],
    appEditor.studentData = [],
    appEditor.table_Id = "",
    appEditor.table_lookup = {},
    appEditor.tableObj = {},
    appEditor.rubricsIndex = {},
    appEditor.snippets = [],
    appEditor.appEditRecords = {
        tempStudent: { stId: "", stNme: "", stCls: "" },
        labelIndex: 0,
        tempStudentRecords: [],
        loadedRubric: []
    },
    appEditor.grader = {
        noRubricCommentsOnly: false,
        loadedRubric: [],
        snippets: [],
        rubric: [], //the slim rubric
        tempRecord: {
            rubricRef: "",
            context: "Assignment",
            activeSections: []
        }
    };
}