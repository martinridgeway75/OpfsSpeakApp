function docEl(id) {
    return document.getElementById(id); // || null
}
function displayMsg(num, eStr) { //ERROR DISPLAY
    var msgArr = {
        a: "Data could not be saved.\n" + eStr,
        b: "Snippets have been updated!",
        c: "" + eStr,
        d: "Rubric could not be created.\n" + eStr,
        e: "Rubric successfully saved!",
        ee: "Rubric is now being shared!",
        f: "Please select an existing rubric to load.",
        g: "A section with that name already exists!",
        h: "Please choose a valid name!",
        i: "Student information has been updated!",
        j: "ID numbers must be unique within each class!",
        k: "Some fields are missing!",
        l: "File requires all 3 headers: 'class', 'id' and 'name'.",
        m: "Not a (utf-8) .csv file!",
        n: "Data could not be found.\n" + eStr,
        o: "Record(s) deleted!",
        p: "Please select at least one record to edit.",
        q: "The class MUST be defined!",
        r: "Record changes were saved!",
        s: "Record was saved!",
        t: "Please choose a student!",
        u: "Please choose a score for each criteria.",
        v: "No relevant snippets available!",
        w: "Please specify the context!",
        x: "Please choose at least ONE section to grade!",
        y: "Cannot load the selected rubric\n" + eStr,
        z: "Given score exceeds the maximum score!"
    };
    var msg = msgArr[num] || "Error.";

    window.mscAlert({
        title: "",
        subtitle: msg
    });
}
function fixNewlinesInContentEditable(elId) {
    var patt0 = new RegExp("<div>","g");

    if (elId !== null) {
        docEl(elId).innerHTML = docEl(elId).innerHTML.replace(patt0," <div>");

        return cleanValue(docEl(elId).textContent);
    }
    return "";
}
function cleanWs(str) {
    return str.replace(/\s+/g,'');
}
function cleanTrailingWs(str) {
    return str.replace(/[\s\t]+$/, '');
}
function uniqueValues(arr) {
    var filtered = [];
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        for (var j = i + 1; j < len; j++) {
            if (arr[i] === arr[j]) { // If a[i] is found later in the array...
                j = ++i;
            }
        }
        filtered.push(arr[i]);
    }
    return filtered;
}
function emptyContent(parentEl) {
    if (!parentEl.hasChildNodes()) { return; }

    while (parentEl.hasChildNodes()) {
        while (parentEl.lastChild.hasChildNodes()) {
            parentEl.lastChild.removeChild(parentEl.lastChild.lastChild);
        }
        parentEl.removeChild(parentEl.lastChild);
    }
}
function getKeyGivenValue(obj, value) {
    return Object.keys(obj)[Object.values(obj).indexOf(value)];
}
function stripHtmlFromText(str) { //strip markup from content pasted into editable div
    return str.replace(/(<([^>]+)>)/ig,"");
}
function getPaste(e) {
    e.preventDefault();

    let text = (e.clipboardData || window.clipboardData).getData("text");

    text = stripHtmlFromText(text);

    const selection = window.getSelection();

    if (!selection.rangeCount) {
        return
    };
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    selection.collapseToEnd();
}
function numsOnly(str) {
    return Number((str.replace(/[^0-9\.]/gmi, '').replace(/[\s\t]+$/, '')));
}
function isObjEmpty(obj) {
    if (obj === null) {
        return true;
    }
    else if (typeof obj !== "object") {
        return true;
    } else {
        return Object.keys(obj).length === 0; //true if obj is empty, false if has prop.s
    }
}
function cleanValue(name) {
    return ((name.replace(/\s+/g,' ')).replace(/^\s+|\s+$/g, ''));
}
function uniqueNestedArrs(arrayOfArrays, idx) { //using this to filter dup. id.s (numbers) from getCandidatesByClass()
    var filtered = [];
    var len = arrayOfArrays.length;
    var i,
        j;

    for (i = 0; i < len; i++) {
        for (j = i + 1; j < len; j++) {
            if (arrayOfArrays[i][idx] === arrayOfArrays[j][idx]) { // If a[i][idx] is found later in the array...
                j = ++i;
            }
        }
        filtered.push(arrayOfArrays[i]);
    }
    return filtered;
}
function charsToUnderscore(str) {
    str = (str.replace(/[^a-zA-Z\0-9\-\u3130-\u318F\uAC00-\uD7AF\_]/gmi, '_')).replace(/\s/g, '_');
    return str;
}
