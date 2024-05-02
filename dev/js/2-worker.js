
//from main thread:
//  data = { obj: {}, fileName: "recordsIdx", subDir: { path: "records", obj: {}, fileUid: "123-456789-78987987" } //files in records and rubrics subDir.s
//  or
//  data = { obj: {}, fileName: "studentData" } //studentData, snippets, recordsIdx, rubricsIdx

onmessage = (e) => {
    const data = e.data;

    if (data?.subDir) {
        writeToFileInSubDir(data.subDir);
    }
    writeToFile(data.obj, data.fileName);
}

async function writeToFileInSubDir(subDir) {
//  subDir: { path: "records", obj: {}, fileUid: "123-456789-78987987" }

    const content = prepFileContent(subDir.obj);
    const opfsRoot = await navigator.storage.getDirectory();
    const subDir = opfsRoot.getDirectoryHandle(subDir.path, { create: true });  //TODO: don't allow create here, need a startup check .exists()
    const recordFileHandle = await subDir.getFileHandle(subDir.fileUid, {create: true}); //create true needed here
    const recordAccessHandle = await recordFileHandle.createSyncAccessHandle();

    recordAccessHandle.truncate(0);
    recordAccessHandle.write(content, {at: 0});
    recordAccessHandle.flush();
    recordAccessHandle.close();
}

function prepFileContent(obj) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();
    
    return textEncoder.encode(str);
}

async function writeToFile(obj, fileName) {
    const content = prepFileContent(obj);
    const opfsRoot = await navigator.storage.getDirectory();
    const idxFileHandle = await opfsRoot.getFileHandle(fileName, {create: true}); //TODO: don't allow create here, need a startup check .exists()
    const idxAccessHandle = await idxFileHandle.createSyncAccessHandle();

    idxAccessHandle.truncate(0);
    idxAccessHandle.write(content, {at: 0});
    idxAccessHandle.flush();
    idxAccessHandle.close();
}