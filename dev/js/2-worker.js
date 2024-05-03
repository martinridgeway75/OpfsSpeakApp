
onmessage = (e) => {
    const data = e.data;

    if (data?.subDir) {
        writeFileToSubDir(data.subDir);
    }
    writeFile(data.obj, data.fileName);
};

function prepFileContent(obj) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();

    return textEncoder.encode(str);
}
async function writeFileToSubDir(subDir) {
    const content = prepFileContent(subDir.obj);
    const opfsRoot = await navigator.storage.getDirectory();
    const opfsSubDir = await opfsRoot.getDirectoryHandle(subDir.path, { create: true });  //TODO: don't allow create here, need a startup check .exists()
    const recordFileHandle = await opfsSubDir.getFileHandle(subDir.fileUid, {create: true}); //create true needed here
    const recordAccessHandle = await recordFileHandle.createSyncAccessHandle();

    recordAccessHandle.truncate(0);
    recordAccessHandle.write(content, {at: 0});
    recordAccessHandle.flush();
    recordAccessHandle.close();
    postMessage("new file done");
}
async function writeFile(obj, fileName) {
    const content = prepFileContent(obj);
    const opfsRoot = await navigator.storage.getDirectory();
    const idxFileHandle = await opfsRoot.getFileHandle(fileName, {create: true}); //TODO: don't allow create here, need a startup check .exists()
    const idxAccessHandle = await idxFileHandle.createSyncAccessHandle();

    idxAccessHandle.truncate(0);
    idxAccessHandle.write(content, {at: 0});
    idxAccessHandle.flush();
    idxAccessHandle.close();
    postMessage("idx done");
}