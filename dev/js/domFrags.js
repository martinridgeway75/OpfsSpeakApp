//@DOM PUNCHING

function frag_createStudentEl(studentIndex, referenceObj) {
    var newTr = document.createElement("tr");
    var newTd1 = document.createElement("td");
    var newTd2 = document.createElement("td");
    var newTd3 = document.createElement("td");
    var newTd4 = document.createElement("td");
    var newSpan = document.createElement("span");
    var newInput1 = document.createElement("input");
    var newInput2 = document.createElement("input");
    var newInput3 = document.createElement("input");

    newTd1.className = "col-lg-4 col-md-4 col-sm-4 col-xs-4";
    newTd2.className = "col-lg-4 col-md-4 col-sm-4 col-xs-4";
    newTd3.className = "col-lg-4 col-md-4 col-sm-4 col-xs-4";
    newInput1.id = "yc" + studentIndex;
    newInput1.value = referenceObj.stCls;
    newInput2.id = "yf" + studentIndex;
    newInput2.value = referenceObj.stId;
    newInput3.id = "yn" + studentIndex;
    newInput3.value = referenceObj.stNme;
    newTd4.className = "col-width30 text-center";
    newSpan.id = "yd" + studentIndex;
    newSpan.className = "btn btn-xs btn-danger";
    newSpan.textContent = "\u2716";
    newTr.id = "yt" + studentIndex;

    newTd1.appendChild(newInput1);
    newTd2.appendChild(newInput2);
    newTd3.appendChild(newInput3);
    newTd4.appendChild(newSpan);
    newTr.appendChild(newTd1);
    newTr.appendChild(newTd2);
    newTr.appendChild(newTd3);
    newTr.appendChild(newTd4);
    return newTr;
}

//main: 
function createSnippetEl(objIndex, snptIndex, txt) {
    let container = docEl("snptsTbd");
    let frag = document.createDocumentFragment();
    let content = frag_createSnippetEl(objIndex, snptIndex, txt);

    frag.appendChild(content);
    container.appendChild(frag);
}
function frag_createSnippetEl(objIndex, snptIndex, txt) {
    var newDiv1 = document.createElement("div");
    var newDiv3 = document.createElement("div");
    var newTr = document.createElement("tr");
    var newTd1 = document.createElement("td");
    var newTd2 = document.createElement("td");
    var newTd3 = document.createElement("td");
    var newTd4 = document.createElement("td");
    var newSpan2 = document.createElement("span");
    var newSelect1 = document.createElement("select");
    var newSelect2 = document.createElement("select");
    var selectIid = "iu" + objIndex + "-" + snptIndex;
    //index of obj in appEditor.snippets, index of the snippet within the array of snippets of the obj, the content of the snippet
    newTr.id = "ii" + objIndex + "-" + snptIndex;
    newTd1.className = "text-center";
    newDiv1.className = "selectSnippet select-styleO";
    newSelect1.id = selectIid;
    //onchange Rubric dropdown: repopulate the Section select to show the corresponding sections for the rubric selected
    newSelect1.onchange = function(){ fireUpdateSingleTagSnippetSection(selectIid); };
    newTd2.className = "text-center";
    newDiv3.className = "selectSnippet select-styleO";
    newSelect2.id = "ia" + objIndex + "-" + snptIndex;
    newTd3.id = "ix" + objIndex + "-" + snptIndex;
    newTd3.contentEditable = "true";
    newTd3.textContent = txt;
    newTd4.className = "col-width30 text-center";
    newSpan2.id = "ie" + objIndex + "-"+ snptIndex;
    newSpan2.className = "btn btn-xs btn-danger";
    newSpan2.textContent = "\u2716";

    newDiv1.appendChild(newSelect1);
    newTd1.appendChild(newDiv1);
    newDiv3.appendChild(newSelect2);
    newTd2.appendChild(newDiv3);
    newTd4.appendChild(newSpan2);
    newTr.appendChild(newTd1);
    newTr.appendChild(newTd2);
    newTr.appendChild(newTd3);
    newTr.appendChild(newTd4);
    return newTr;
}
function frag_createFinalRecordElForNoRubricPt1(recordIndex, dateTime, score, ctx) {
    var newDiv1 = document.createElement("div");
    var newDiv3 = document.createElement("div");
    var newDiv4 = document.createElement("div");
    var newDiv5 = document.createElement("div");
    var newDiv6 = document.createElement("div");
    var newDiv10 = document.createElement("div");
    var newDiv11 = document.createElement("div");
    var newDiv12 = document.createElement("div");
    var newDiv13 = document.createElement("div");
    var newDiv14 = document.createElement("div");
    var newDiv15 = document.createElement("div");
    var newDiv17 = document.createElement("div");
    var newInput2 = document.createElement("input");
    var newInput3 = document.createElement("input");
    var newSpan4 = document.createElement("span");
    var newInput1 = document.createElement("input");
    var newSpan2 = document.createElement("span");
    var newSpan3 = document.createElement("span");

    newDiv14.className = "col-lg-3 col-md-3 col-sm-3 col-xs-6 fbkSection";
    newDiv15.className = "feedbackLabel text-center";
    newDiv15.textContent = "Score";
    newDiv17.className = "text-center";
    newInput2.type = "number";
    newInput2.id = "ts" + recordIndex;
    newInput2.className = "genTotalScore";
    newInput2.value = score.scr;
    newSpan4.textContent = " / ";
    newInput3.type = "number";
    newInput3.id = "tm" + recordIndex;
    newInput3.className = "genTotalScore";
    newInput3.value = score.max;
    newDiv1.id = "fh" + recordIndex;
    newDiv1.className = "row";
    newDiv3.className = "col-lg-12 recordWrapper";
    newDiv4.className = "row";
    newDiv5.className = "col-lg-12";
    newDiv6.id = "fuSection" + recordIndex;
    newDiv10.className = "row";
    newDiv10.style.marginLeft = 0;
    newDiv10.style.marginRight = 0;
    newDiv11.className = "col-lg-9 col-md-9 col-sm-9 fbkSection";
    newDiv12.className = "feedbackLabel";
    newDiv12.textContent = "General feedback";
    newDiv13.id="opt1_" + recordIndex;
    newDiv13.contentEditable = "true";
    newDiv13.className = "fbkA commentBtnA";
    newInput1.id = "fc" + recordIndex;
    newInput1.className = "inputContext";
    newInput1.value = ctx;
    newSpan2.textContent = dateTime;
    newSpan2.className = "btn-xs pull-right";
    newSpan3.id = "fx" + recordIndex + "-0";
    newSpan3.className = "btn btn-xs btn-dangerous pull-right destroyRecord";
    newSpan3.textContent = "Delete Record";

    newDiv17.appendChild(newInput2);
    newDiv17.appendChild(newSpan4);
    newDiv17.appendChild(newInput3);
    newDiv11.appendChild(newDiv12);
    newDiv11.appendChild(newDiv13);
    newDiv14.appendChild(newDiv15);
    newDiv14.appendChild(newDiv17);
    newDiv10.appendChild(newDiv11);
    newDiv10.appendChild(newDiv14);
    newDiv5.appendChild(newInput1);
    newDiv5.appendChild(newSpan3);
    newDiv5.appendChild(newSpan2);
    newDiv4.appendChild(newDiv5);
    newDiv3.appendChild(newDiv4);
    newDiv3.appendChild(newDiv6);
    newDiv3.appendChild(newDiv10);
    newDiv1.appendChild(newDiv3);
    return newDiv1;
}
function frag_createFinalRecordElForNoRubricPt2(recordIndex, dateTime, ctx) {
    var newSpanRubric1 = document.createElement("span");
    var newDivRubric1 = document.createElement("div");
    var newDivRubric3 = document.createElement("div");
    var newDivRubric4 = document.createElement("div");
    var newDivRubric5 = document.createElement("div");

    newDivRubric1.id = "fq" + recordIndex;
    newDivRubric1.className = "row nodisplay";
    newDivRubric3.className = "col-lg-12 recordWrapper";
    newDivRubric4.className = "row text-center";
    newDivRubric4.style.marginBottom = 5 + "px";
    newDivRubric4.textContent = "Rubric for " + ctx + " - " + dateTime + " ";
    newDivRubric5.id = "frrA" + recordIndex;
    newDivRubric5.className = "row small";
    newSpanRubric1.id = "fw" + recordIndex;
    newSpanRubric1.className = "btn btn-sm btn-default";
    newSpanRubric1.textContent = "Back to record";

    newDivRubric4.appendChild(newSpanRubric1);
    newDivRubric3.appendChild(newDivRubric4);
    newDivRubric3.appendChild(newDivRubric5);
    newDivRubric1.appendChild(newDivRubric3);
    return newDivRubric1;
}
function frag_createFinalRecordElPt1(recordIndex, dateTime, fdbck, ctx) {
    var newDiv1 = document.createElement("div");
    var newDiv3 = document.createElement("div");
    var newDiv4 = document.createElement("div");
    var newDiv5 = document.createElement("div");
    var newDiv6 = document.createElement("div");
    var newDiv10 = document.createElement("div");
    var newDiv11 = document.createElement("div");
    var newDiv12 = document.createElement("div");
    var newDiv13 = document.createElement("div");
    var newDiv14 = document.createElement("div");
    var newDiv15 = document.createElement("div");
    var newDiv17 = document.createElement("div");
    var newInput1 = document.createElement("input");
    var newSpan2 = document.createElement("span");
    var newSpan3 = document.createElement("span");
    var newDiv22 = document.createElement("div");
    var newDiv23 = document.createElement("div");
    var newLabel2 = document.createElement("label");
    var newInput2 = document.createElement("input");
    var newSpan4 = document.createElement("span");

    newDiv14.className = "col-lg-3 col-md-3 col-sm-3 col-xs-6 fbkSection";
    newDiv15.className = "feedbackLabel text-center";
    newDiv15.textContent = "Rubric";
    newDiv17.className = "text-center";
    newDiv22.className = "squaredFour";
    newDiv22.style.display = "inline-block";
    newInput2.type = "checkbox";
    newInput2.id = "opt2_" + recordIndex;
    newInput2.value = "nada";
    newInput2.checked = fdbck;
    newLabel2.htmlFor = "opt2_" + recordIndex;
    newSpan4.className = "small";
    newSpan4.textContent = "Include";
    newDiv23.id = "fv" + recordIndex;
    newDiv23.className = "small btn btn-sm btn-default rubricViewer";
    newDiv23.style.marginLeft = 10 + "px";
    newDiv23.textContent = "View rubric";
    newDiv22.appendChild(newInput2);
    newDiv22.appendChild(newLabel2);
    newDiv17.appendChild(newDiv22);
    newDiv17.appendChild(newSpan4);
    newDiv17.appendChild(newDiv23);
    newDiv1.id = "fh" + recordIndex;
    newDiv1.className = "row";
    newDiv3.className = "col-lg-12 recordWrapper";
    newDiv4.className = "row";
    newDiv5.className = "col-lg-12";
    newDiv6.id = "fuSection" + recordIndex;
    newDiv10.className = "row";
    newDiv10.style.marginLeft = 0;
    newDiv10.style.marginRight = 0;
    newDiv11.className = "col-lg-9 col-md-9 col-sm-9 fbkSection";
    newDiv12.className = "feedbackLabel";
    newDiv12.textContent = "General feedback";
    newDiv13.id="opt1_" + recordIndex;
    newDiv13.contentEditable = "true";
    newDiv13.className = "fbkA commentBtnA";
    newInput1.id = "fc" + recordIndex;
    newInput1.className = "inputContext";
    newInput1.value = ctx;
    newSpan2.textContent = dateTime;
    newSpan2.className = "btn-xs pull-right";
    newSpan3.id = "fx" + recordIndex + "-0";
    newSpan3.className = "btn btn-xs btn-dangerous pull-right destroyRecord";
    newSpan3.textContent = "Delete Record";

    newDiv11.appendChild(newDiv12);
    newDiv11.appendChild(newDiv13);
    newDiv14.appendChild(newDiv15);
    newDiv14.appendChild(newDiv17);
    newDiv10.appendChild(newDiv11);
    newDiv10.appendChild(newDiv14);
    newDiv5.appendChild(newInput1);
    newDiv5.appendChild(newSpan3);
    newDiv5.appendChild(newSpan2);
    newDiv4.appendChild(newDiv5);
    newDiv3.appendChild(newDiv4);
    newDiv3.appendChild(newDiv6);
    newDiv3.appendChild(newDiv10);
    newDiv1.appendChild(newDiv3);
    return newDiv1;
}
function frag_createFinalRecordElPt2(recordIndex, dateTime, ctx) {
    var newSpanRubric1 = document.createElement("span");
    var newDivRubric1 = document.createElement("div");
    var newDivRubric3 = document.createElement("div");
    var newDivRubric4 = document.createElement("div");
    var newDivRubric5 = document.createElement("div");

    newDivRubric1.id = "fq" + recordIndex;
    newDivRubric1.className = "row nodisplay";
    newDivRubric3.className = "col-lg-12 recordWrapper";
    newDivRubric4.className = "row text-center";
    newDivRubric4.style.marginBottom = 5 + "px";
    newDivRubric4.textContent = "Rubric for " + ctx + " - " + dateTime + " ";
    newDivRubric5.id = "frrA" + recordIndex;
    newDivRubric5.className = "row small";
    newSpanRubric1.id = "fw" + recordIndex;
    newSpanRubric1.className = "btn btn-sm btn-default";
    newSpanRubric1.textContent = "Back to record";

    newDivRubric4.appendChild(newSpanRubric1);
    newDivRubric3.appendChild(newDivRubric4);
    newDivRubric3.appendChild(newDivRubric5);
    newDivRubric1.appendChild(newDivRubric3);
    return newDivRubric1;
}
function frag_createFinalRecordSectionEl(recordIndex, sectionName, sectionIndex) {
    var newDiv0 = document.createElement("div");
    var newDiv1 = document.createElement("div");
    var newSpan1 = document.createElement("span");
    var newInput = document.createElement("input");
    var newTable = document.createElement("table");
    var newThead = document.createElement("thead");
    var newTr = document.createElement("tr");
    var newTh1 = document.createElement("th");
    var newTh2 = document.createElement("th");
    var newTh3 = document.createElement("th");
    var newTh4 = document.createElement("th");
    var newTbody = document.createElement("tbody");

    newDiv0.id = "fu" + recordIndex + "-" + sectionIndex;
    newDiv0.style.marginBottom = 10 + "px";
    newDiv1.style.marginBottom = 5 + "px";
    newSpan1.textContent = "Section: ";
    newInput.id = "opt4_" + recordIndex + "_" + sectionIndex;
    newInput.className = "finalRecordSection";
    newInput.value = sectionName;
    newTable.className = "table table-condensed table-bordered";
    newTable.style.marginBottom = 5 + "px";
    newThead.className = "text-center tableHeader";
    newTh1.className = "col-width120";
    newTh1.textContent = "Criteria";
    newTh2.className = "col-width50";
    newTh2.textContent = "Score";
    newTh3.className = "col-width50";
    newTh3.textContent = "Max.";
    newTh4.className = "col-lg-6 col-md-6 col-sm-6";
    newTh4.textContent = "Descriptor";
    newTbody.id = "ff" + recordIndex + "-" + sectionIndex;

    newDiv1.appendChild(newSpan1);
    newDiv1.appendChild(newInput);
    newTr.appendChild(newTh1);
    newTr.appendChild(newTh2);
    newTr.appendChild(newTh3);
    newTr.appendChild(newTh4);
    newThead.appendChild(newTr);
    newTable.appendChild(newThead);
    newTable.appendChild(newTbody);
    newDiv0.appendChild(newDiv1);
    newDiv0.appendChild(newTable);
    return newDiv0;
}
function frag_createFinalRecordCriteriasEl(recordIndex, sectionIndex, allCriterias, fdbck, comments) { //creates one row (tr) for each criteria of a section
    var allCriteriasLength = allCriterias.length;
    var newTr2 = document.createElement("tr"); //the section comment...
    var newTd6 = document.createElement("td");
    var newTd7 = document.createElement("td");
    var i,
        ii,
        tableRow,
        criteriaId,
        criteria,
        criteriaRange,
        scoreRange;

    for (i = 0; i < allCriteriasLength; i++) {
        criteriaId = "ff" + recordIndex + "-" + sectionIndex + "-" + i + "-";
        criteria = allCriterias[i];
        criteriaRange = fdbck.sectionDef[i].criteriaDef;
        scoreRange = criteriaRange.map( function(el) { return el.score; });

        tableRow = frag_createFinalRecordCriteriasElTr(i, criteriaId, criteria, scoreRange);
        frag.appendChild(tableRow);
    }
    newTd6.textContent = "Comment:";
    newTd7.id = "opt3_" + recordIndex + "_" + sectionIndex;
    newTd7.contentEditable = "true";
    newTd7.textContent = appEditor.appEditRecords.tempStudentRecords[recordIndex].comments[sectionIndex];
    newTd7.colSpan = "3";
    newTr2.appendChild(newTd6);
    newTr2.appendChild(newTd7);
    frag.appendChild(newTr2);
    return frag;
}
function frag_createFinalRecordCriteriasElTr(i, criteriaId, criteria, scoreRange) {
    var newTr = document.createElement("tr");
    var newTd1 = document.createElement("td");
    var newTd2 = document.createElement("td");
    var newTd3 = document.createElement("td");
    var newTd4 = document.createElement("td");
    var newDiv2 = document.createElement("div");
    var newSelect1 = document.createElement("select");
    var scoreRangeLen = scoreRange.length;

    //newTd1.id = criteriaId + "0";
    newTd1.textContent = criteria[0]; //[sectionIndex][criteriaIndex][criteria, score, max., descriptor]
    newDiv2.className = "selectScore select-styleO";
    newSelect1.id = criteriaId + "1";

    for (ii = 0; ii < scoreRangeLen; ii++) {
        var newOpt = document.createElement("option");

        newOpt.value = scoreRange[ii];
        newOpt.textContent = scoreRange[ii];

        if (scoreRange[ii] === criteria[1]) { newOpt.selected = true; }
        newSelect1.appendChild(newOpt);
    }
    //newTd3.id = criteriaId + "2";
    newTd3.textContent = criteria[2];
    newTd4.id = criteriaId + "3";
    newTd4.textContent = criteria[3];

    newDiv2.appendChild(newSelect1);
    newTd2.appendChild(newDiv2);
    newTr.appendChild(newTd1);
    newTr.appendChild(newTd2);
    newTr.appendChild(newTd3);
    newTr.appendChild(newTd4);
    return newTr;
}













function frag_buildStudentgMap() {
    var clsses = allgClasses();
    var frag = document.createDocumentFragment();
    var container = docEl("mgap");
    var stdnts,
        i,
        ii;

    emptyContent(container);

    for (i = 0; i < clsses.length; i++) {
        var newDiv1 = document.createElement("div");
        var newDiv2 = document.createElement("div");

        newDiv1.id = "gh" + i;
        newDiv1.textContent = "Class: " + clsses[i];
        newDiv1.className = "mapClass";
        stdnts = getgCandidatesByClass(clsses[i]);

        for (ii = 0; ii < stdnts.length; ii++) {
            var newBtn1 = document.createElement("div");

            newBtn1.id = "gy" + i + "-" + ii;
            newBtn1.dataset.cls = clsses[i];
            newBtn1.dataset.sid = stdnts[ii][0];
            newBtn1.dataset.nme = stdnts[ii][1];
            newBtn1.className = "btn btn-sm btn-inline btn-default";
            newBtn1.style.margin = 1 + "px";
            newBtn1.textContent = stdnts[ii][0] + " " + stdnts[ii][1];
            newDiv2.appendChild(newBtn1);
        }
        newDiv2.id = "gb" + i;
        frag.appendChild(newDiv1);
        frag.appendChild(newDiv2);
    }
    container.appendChild(frag);
}






function frag_populateAllgClassesSelectBox() {
    var clsses = allgClasses();
    var selectId = docEl("chooseClass");
    var frag = document.createDocumentFragment();
    var newOpt0 = document.createElement("option");
    var i;

    newOpt0.value = "";
    newOpt0.textContent = "Class";
    frag.appendChild(newOpt0);

    for (i = 0; i < clsses.length; i++) {
        var newOpt1 = document.createElement("option");

        newOpt1.value = clsses[i];
        newOpt1.textContent = clsses[i];
        frag.appendChild(newOpt1);
    }
    emptyContent(selectId);
    selectId.appendChild(frag);
    selectId.firstChild.setAttribute("disabled", true);
    selectId.firstChild.setAttribute("selected", true);
}
function frag_populateStudentsByClass(clss, bool) {
    var stdnts = getgCandidatesByClass(clss);
    var selectId = docEl("chooseId");
    var frag = document.createDocumentFragment();
    var newOpt0 = document.createElement("option");
    var i;

    newOpt0.value = "";
    newOpt0.dataset.nme = "";
    newOpt0.textContent = "Student";
    frag.appendChild(newOpt0);

    for (i = 0; i < stdnts.length; i++) {
        var newOpt1 = document.createElement("option");

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
function frag_createGradingSnippetEl(snippetIndex, txt) {
    var container = docEl("snpptgContainer");
    var frag = document.createDocumentFragment();
    var newDiv1 = document.createElement("div");
    var newDiv2 = document.createElement("div");
    var newTr = document.createElement("tr");
    var newTd1 = document.createElement("td");
    var newTd2 = document.createElement("td");
    var newTd3 = document.createElement("td");
    var newSpan1 = document.createElement("span");
    var newInput = document.createElement("input");
    var newLabel = document.createElement("label");
    var newTag = document.createElement("span");

    newTd1.className = "text-center";
    newSpan1.id = "gn" + snippetIndex;
    newSpan1.className = "helperNum";
    newDiv2.className = "squaredFour snpptChkbx";
    newInput.type = "checkbox";
    newInput.id = "gc" + snippetIndex;
    newLabel.htmlFor = "gc" + snippetIndex;
    newTd2.className = "text-center";
    newTag.id = "gt" + snippetIndex;
    newTag.className = "small";
    newTd3.id = "gx" + snippetIndex;
    newTd3.textContent = txt;

    newDiv2.appendChild(newInput);
    newDiv2.appendChild(newLabel);
    newDiv1.appendChild(newSpan1);
    newDiv1.appendChild(newDiv2);
    newTd1.appendChild(newDiv1);
    newTd2.appendChild(newTag);
    newTr.appendChild(newTd1);
    newTr.appendChild(newTd2);
    newTr.appendChild(newTd3);
    frag.appendChild(newTr);
    container.appendChild(frag);

    createTagsForSnippets(snippetIndex);
}
function frag_createGradingRubriksButtons(rubrikKey, rubrikName) {
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
function frag_createNoRubricGradingRubrikButton() {
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
function frag_setUpChkbxSections(bool) {
    var frag,
        allSectionNames,
        i;

    docEl("gaSctnTextHelper").textContent = "";
    emptyContent(docEl('gaCbContainer'));

    if (bool !== true) { return; }

    frag = document.createDocumentFragment();
    allSectionNames = getSectionNames(appEditor.grader.rubricFilter);

    for (i = 0; i < allSectionNames.length; i++) {
        var newDiv1 = document.createElement("div");
        var newDiv2 = document.createElement("div");
        var gnumDiv = document.createElement("div");
        var newInput1 = document.createElement("input");
        var newLabel1 = document.createElement("label");
        var newSpan1 = document.createElement("span");

        newDiv2.className = "squaredFour";
        gnumDiv.id = "gs" + i;
        gnumDiv.className = "helperNum";
        newInput1.type = "checkbox";
        newInput1.id = "gw" + (i+1);
        newInput1.value = i;
        newInput1.checked = false;
        newLabel1.htmlFor = "gw" + (i+1);
        newSpan1.textContent = allSectionNames[i];
        newDiv1.appendChild(gnumDiv);
        newDiv2.appendChild(newInput1);
        newDiv2.appendChild(newLabel1);
        newDiv1.appendChild(newDiv2);
        newDiv1.appendChild(newSpan1);
        frag.appendChild(newDiv1);
    }
    docEl("gaSctnTextHelper").textContent = "...and the sections to use (in order):";
    docEl('gaCbContainer').appendChild(frag);
}
function frag_createGradingCriteriasEl(sectionIndex) { //creates one row (tr) for each criteria of a section
    var container = docEl("gf" + sectionIndex);
    var frag = document.createDocumentFragment();
    var allCriterias = appEditor.grader.rubric[sectionIndex].sectionDef;
    var allCriteriasLength = allCriterias.length;
    var newTr2 = document.createElement("tr"); //the section comment...
    var newTd6 = document.createElement("td");
    var newTd7 = document.createElement("td");
    var newPasteSpan = document.createElement("span");
    var i,
        ii;

    for (i = 0; i < allCriteriasLength; i++) {
        var newTr = document.createElement("tr");
        var newTd1 = document.createElement("td");
        var newTd2 = document.createElement("td");
        var newTd3 = document.createElement("td");
        var newTd4 = document.createElement("td");
        var criteriaId = "gf" + sectionIndex + "-" + i + "-";
        var newDiv2 = document.createElement("div");
        var newSelect1 = document.createElement("select");
        var criteriaRange = allCriterias[i].criteriaDef;
        var scoreRange = criteriaRange.map( function(el) { return el.score; }).sort( function(a,b){ return a < b; });
        var scoreRangeLen = scoreRange.length;
        var maxScore = scoreRange[scoreRangeLen - 1];
        var newFirstOpt = document.createElement("option"); //placeholder @selectedIndex = 0

        newTd1.id = criteriaId + "0";
        newTd1.textContent = allCriterias[i].criteriaName;
        newDiv2.className = "selectScore select-styleO";
        newSelect1.id = criteriaId + "1";
        newFirstOpt.value = "";
        newFirstOpt.textContent = "-";
        newFirstOpt.selected = true;
        newSelect1.appendChild(newFirstOpt);

        for (ii = 0; ii < scoreRangeLen; ii++) {
            var newOpt = document.createElement("option");

            newOpt.value = scoreRange[ii];
            newOpt.textContent = scoreRange[ii];
            newSelect1.appendChild(newOpt);
        }
        newTd3.id = criteriaId + "2";
        newTd3.textContent = maxScore;
        newTd4.id = criteriaId + "3";
        newTd4.textContent = ""; //default @ newOpt.selected

        newDiv2.appendChild(newSelect1);
        newTd2.appendChild(newDiv2);
        newTr.appendChild(newTd1);
        newTr.appendChild(newTd2);
        newTr.appendChild(newTd3);
        newTr.appendChild(newTd4);
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
function frag_createSectionElTables(i) {
    var container = docEl("gq" + i);
    var frag = document.createDocumentFragment();
    var newTable = document.createElement("table");
    var newThead = document.createElement("thead");
    var newTr = document.createElement("tr");
    var newTh1 = document.createElement("th");
    var newTh2 = document.createElement("th");
    var newTh3 = document.createElement("th");
    var newTh4 = document.createElement("th");
    var newTbody = document.createElement("tbody");

    newTable.className = "table table-condensed table-bordered";
    newTable.style.marginBottom = 5 + "px";
    newThead.className = "text-center tableHeader";
    newTh1.className = "col-width120";
    newTh1.textContent = "Criteria";
    newTh2.className = "col-width50";
    newTh2.textContent = "Score";
    newTh3.className = "col-width50";
    newTh3.textContent = "Max.";
    newTh4.className = "col-lg-6 col-md-6 col-sm-6";
    newTh4.textContent = "Descriptor";
    newTbody.id = "gf" + i;

    newTr.appendChild(newTh1);
    newTr.appendChild(newTh2);
    newTr.appendChild(newTh3);
    newTr.appendChild(newTh4);
    newThead.appendChild(newTr);
    newTable.appendChild(newThead);
    newTable.appendChild(newTbody);
    frag.appendChild(newTable);
    container.appendChild(frag);
}
function frag_createUISections() {
    emptyContent(docEl('datgEntry'));
    var i;
    var frag = document.createDocumentFragment();

    for (i = 0; i < appEditor.grader.rubric.length; i++) { //each section wrapper
        var newDiv2 = document.createElement("div"); //locked section preview
        var newDiv3 = document.createElement("div");
        var newDiv4 = document.createElement("div");
        var newDiv5 = document.createElement("div");
        var newDiv6 = document.createElement("div");
        var newDiv7 = document.createElement("div");
        var newDiv5a = document.createElement("div");
        var newDiv6a = document.createElement("div");
        var newDiv15 = document.createElement("div");
        var newDiv16 = document.createElement("div");
        var newDiv17 = document.createElement("div");

        newDiv2.className = "row";
        newDiv3.className = "col-lg-12 wrapTextPreline";
        newDiv3.id = "gv" + i;
        newDiv5.className = "row";
        newDiv6.className = "col-lg-12 sectionLabel";
        newDiv6.textContent = appEditor.grader.rubric[i].sectionName;
        newDiv7.id = "gq" + i;
        newDiv7.className = "row";
        newDiv5a.className = "row";
        newDiv6a.className = "col-lg-12";
        newDiv15.className = "row";
        newDiv16.className = "col-lg-12 text-center";

        //TODO: want a button, not a div ...want to be able to tab onto this

        newDiv17.id = "gj" + i;
        newDiv17.className = "btn btn-sm btn-primary commitBtn icon-lock-open";
        newDiv17.textContent = "";

        newDiv5a.appendChild(newDiv6a);
        newDiv5.appendChild(newDiv6);
        newDiv4.appendChild(newDiv5);
        newDiv4.appendChild(newDiv5a);
        newDiv4.appendChild(newDiv7);
        newDiv2.appendChild(newDiv3);
        newDiv4.appendChild(newDiv2);
        newDiv16.appendChild(newDiv17);
        newDiv15.appendChild(newDiv16);
        newDiv4.appendChild(newDiv15);
        frag.appendChild(newDiv4);
    }
    docEl('datgEntry').appendChild(frag);
}
function frag_populateFullRubric() {
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
function frag_createAvailableRubriksButtons(rubrikNameKey) {
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
function frag_createAvailableRubriksDivider() {
    var container = docEl("ruLoadChkBoxes"); //fieldset
    var frag = document.createDocumentFragment();
    var newDiv0 = document.createElement("DIV");

    newDiv0.className = "rubricsDivider";

    frag.appendChild(newDiv0);
    container.appendChild(frag);
}