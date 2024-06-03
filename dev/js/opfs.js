//@main
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











//TODO: import, export all data

let appEditor = {
    "recordsIndex":{
        "-NycFr5uM0FTXs6Ev1cv": { "context":"Midterm Exam","stCls":"1011","stId":"12345678","stNme":"test","timeStamp":1716514944056 },
        "-NycG1XGSb78n88Pkv35": { "context":"Final Exam","stCls":"1011","stId":"12345678","stNme":"test","timeStamp":1716514990863 }
    },
    // "recordsIndex":[
    //     {"recordKey":"-NycFr5uM0FTXs6Ev1cv","context":"Midterm Exam","stCls":"1011","stId":"12345678","stNme":"test","timeStamp":1716514944056},
    //     {"recordKey":"-NycG1XGSb78n88Pkv35","context":"Final Exam","stCls":"1011","stId":"12345678","stNme":"test","timeStamp":1716514990863}
    // ],
    "rubricsIndex": {
        "-MNmphPX8e6TXvmJHe_8": { "rubricName": "Examples, explanations, comparisons", "sectionNames": [ "Examples, explanations, comparisons" ] },
        "-GNmphPX8e6TXvmJHe_8": { "rubricName": "Examples", "sectionNames": [ "Examples" ] }
    },
    "studentData": [
        { "stCls": "1011", "stId": "12345678", "stNme": "test2" },
        { "stCls": "1012", "stId": "23456789", "stNme": "test1" }
    ],
    "snippets": [
        { "snippetRubric": "any", "snippetDef": [ { "section": "any", "snippet": "a" } ] },
        { "snippetRubric": "any", "snippetDef": [ { "section": "any", "snippet": "b" } ] }
    ]
};

