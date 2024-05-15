
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

function readStudentData(){
    readOnlyDb({ fileName: "studentData" }).then( (data) => { //expect [] || undefined
        hasFetchedStudentData(data);
    });
}
function saveStudentData() {
    writeToDb({ obj: appEditor.studentData, fileName: "studentData" }, "write", hasSetStudentData); //expect <String> e || "OK"
}

/*********callbacks***********/

function hasFetchedStudentData(data) {
    appEditor.studentData = data || []; //onerror, data will be undefined
    initStudentData();

    if (!appEditor.db.students) {
        studentInfoHandlersOn();
        appEditor.db.students = true;
    }   
}
function hasSetStudentData(msg) {
    if (msg === "OK") {
        displayMsg("i");
        return;
    }
    displayMsg("a", msg);
}

/*************************/

function handleStudentsCSV(evt) { //csv upload...
    const file = evt.target.files[0];

    if (file.name.substring(file.name.length - 3) !== "csv") {
        displayMsg("m");
        document.getElementById('nputStudents').reset();
        return;
    }
    window.Papa.parse(file, {
        header: true,
        worker: true,
        dynamicTyping: false,
        encoding: "",
        skipEmptyLines: true,
        complete: function (results) {
            document.getElementById('nputStudents').reset();

            const props = Object.keys(results.data[0]);
            const reqProps = ["class", "id", "name"];
            const foundProps = findPropsInCsv(props, reqProps);

            if (foundProps.length !== 3) { //reqProps.length === 3
                displayMsg("l");
                return;
            }
            parseStudentsCSV(results.data, foundProps);
        }
    });
}
function findPropsInCsv(props, reqProps) {
    const len = props.length;
    let foundProps = [];
    let i,
        ii;

    for (i = 0; i < 3; i++) { //reqProps.length === 3
        for (ii = 0; ii < len; ii++) {
            if (props[ii].toLowerCase() === reqProps[i]) {
                foundProps.push(props[ii]);
                break;
            }
        }
    }
    return foundProps;
}
function parseStudentsCSV(data, props) { //prop order MUST be: "class", "id", "name"
    const len = data.length;
    let i;

    appEditor.csvStudentData = [];

    for (i = 0; i < len; i++) {
        data[i].stCls = cleanTrailingWs(data[i][props[0]]);
        data[i].stId = cleanTrailingWs(data[i][props[1]]);
        data[i].stNme = cleanTrailingWs(data[i][props[2]]);
        appEditor.csvStudentData.push(data[i]);
    }
    addNewStudentsFromCSV();
}
function createClassDivider() {
    const container = document.getElementById("editStudents_body");
    let frag = document.createDocumentFragment();
    let newDiv = document.createElement("div");

    newDiv.className = "col-lg-12";
    newDiv.style.height = 50 + "px";
    frag.appendChild(newDiv);
    container.appendChild(frag);
}
function addNewStudentsFromCSV() {
    const newIndex = docEl("editStudents_body").childNodes.length;
    const len = appEditor.csvStudentData.length;
    let i;

    appEditor.csvStudentData = sortStudentData(appEditor.csvStudentData);

    if (len === 0) {
        emptyContent(docEl("editStudents_body"));
    }
    for (i = 0; i < len - 1; i++) {
        createStudentEl(newIndex + i, appEditor.csvStudentData[i]);

        if (appEditor.csvStudentData[i].stCls !== appEditor.csvStudentData[i + 1].stCls) { createClassDivider(); }
    }
    createStudentEl(newIndex + (len - 1), appEditor.csvStudentData[len - 1]); //add the last student in the list
    createClassDivider();
    appEditor.csvStudentData = [];
}
function sortStudentData(refArr) {
    return refArr.sort(function (a, b) { return a.stCls.localeCompare(b.stCls) || a.stNme.localeCompare(b.stNme); });
}
function reloadStudents(bool) {
    const len = appEditor.studentData.length;
    let i;

    emptyContent(docEl("editStudents_body"));

    if (bool !== true) { return; }
    if (len === 0) { //this is a reload, the empty obj was removed before the save
        addNewStudent();
        return;
    }
    for (i = 0; i < len - 1; i++) {
        createStudentEl(i, appEditor.studentData[i]);

        if (appEditor.studentData[i].stCls !== appEditor.studentData[i + 1].stCls) {
            createClassDivider();
        }
    }
    createStudentEl(len - 1, appEditor.studentData[len - 1]); //add the last student in the list
    createClassDivider();
}
function markStudentInfoForDeletion(elIndex) {
    hideEl("yt" + elIndex);
    docEl("yc" + elIndex).value = "";
    docEl("yf" + elIndex).value = "";
    docEl("yn" + elIndex).value = "";
}
function identifyStudentInfoEl(el) {
    if (el.target !== el.currentTarget) {
        let subStr = (el.target.id).substring(0, 2);
        if (subStr === "yd") {
            markStudentInfoForDeletion((el.target.id).substring(2));
        }
        el.stopPropagation();
    }
}
function chkForEmptyFieldsInStudentInfo(elIdIndexes) { //if all fields are empty set -> "mark_null_for_deletion" in the ID field
    var returnVal = true;
    var clssName,
        idName,
        studentName,
        i;

    for (i = 0; i < elIdIndexes.length; i++) {
        clssName = cleanWs(docEl("yc" + elIdIndexes[i]).value);
        idName = cleanWs(docEl("yf" + elIdIndexes[i]).value);
        studentName = cleanWs(docEl("yn" + elIdIndexes[i]).value);

        if (clssName === "" || idName === "" || studentName === "") {
            if (clssName === "" && idName === "" && studentName === "") {
                docEl("yf" + elIdIndexes[i]).value = "marked_null_for_deletion";
            } else {
                returnVal = false;
                break;
            }
        }
    }
    return returnVal;
}
function chkForDupIdsInStudentInfo(elIdIndexes) { //dup.id's are ok AS LONG AS THEY ARE FROM DIFFERENT CLASSES (and not the same class)
    var returnVal = true;
    var arr = [];
    var dupsArr,
        _id,
        _clss,
        idAndclass,
        i;

    for (i = 0; i < elIdIndexes.length; i++) {
        _id = cleanValue(docEl("yf" + elIdIndexes[i]).value);
        _clss = cleanValue(docEl("yc" + elIdIndexes[i]).value);

        if (_id === "marked_null_for_deletion") {
            _id = "marked_null_for_deletion_" + i; //won't change textContent, but will avoid errors in uniqueValues
            arr.push(_id);
            continue;
        }
        idAndclass = "" + _clss + _id;
        arr.push(idAndclass);
    }
    dupsArr = uniqueValues(arr);

    if (dupsArr.length !== arr.length) { returnVal = false; }

    return returnVal;
}
function addNewStudent() {
    var newIndex; //= docEl("editStudents_body").childNodes.length;
    var newObj = {};

    newObj.stCls = "";
    newObj.stId = "";
    newObj.stNme = "";
    appEditor.studentData.push(newObj);
    newIndex = appEditor.studentData.length - 1;
    createStudentEl(newIndex, appEditor.studentData[newIndex]);
    docEl("yt" + newIndex).scrollIntoView({ behavior: "smooth", block: "center" });
}
function exitUpdatedStudents() {
    var len = appEditor.studentData.length;
    var studentObj,
        i;

    for (i = len - 1; i >= 0; i--) {
        studentObj = appEditor.studentData[i];

        if (studentObj.stCls === "" && studentObj.stId === "" && studentObj.stNme === "") {
            appEditor.studentData.splice(i, 1);
        }
    }
    initStudentData();
}
function saveUpdatedStudents() {
    var idsArr = [];
    var childs = docEl("editStudents_body").childNodes;
    var emptyFieldsChk,
        dupIdsChk;

    for (var el in childs) {
        if (childs[el].nodeName === "TR") {
            idsArr.push(childs[el].id.substring(2));
        }
    }
    if (!idsArr.length) {
        updateStudentData(idsArr);
        return;
    }
    emptyFieldsChk = chkForEmptyFieldsInStudentInfo(idsArr);
    dupIdsChk = chkForDupIdsInStudentInfo(idsArr);

    if (emptyFieldsChk === false) {
        displayMsg("k");
        return;
    }
    if (dupIdsChk === false) {
        displayMsg("j");
        return;
    }
    updateStudentData(idsArr);
    initStudentData();
}
function updateStudentData(idsArr) {
    const len = idsArr.length;
    let newObj,
        i;

    appEditor.studentData = [];

    for (i = 0; i < len; i++) {
        newObj = {};

        if (docEl("yf" + idsArr[i]).value !== "marked_null_for_deletion") {
            newObj.stCls = cleanValue(docEl("yc" + idsArr[i]).value);
            newObj.stId = cleanValue(docEl("yf" + idsArr[i]).value);
            newObj.stNme = cleanValue(docEl("yn" + idsArr[i]).value);
            appEditor.studentData.push(newObj);
        }
    }
    saveStudentData();
}
function resetStudents() { //Array.from?
    let allTargetNodes = docEl("editStudents_body").querySelectorAll("input");

    allTargetNodes.forEach(function (target) { target.value = ""; });
}
function initStudentData() { //init
    if (appEditor.studentData.length) {
        appEditor.studentData = sortStudentData(appEditor.studentData);
    }
    reloadStudents(true);
}