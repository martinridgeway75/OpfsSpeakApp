
onmessage = (e) => {
    const data = e.data;

    writeFile(data.obj, data.fileName).then( () => {
        deleteFilesFromSubDir(data.subDir.fileUidsArr, data.subDir.path).then( () => {
            postMessage(null);
        });
    });
};

function prepFileContent(obj) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();

    return textEncoder.encode(str);
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
}
async function deleteFilesFromSubDir(arrOfFileNames, path) {
    const opfsRoot = await navigator.storage.getDirectory();
    const subDir = await opfsRoot.getDirectoryHandle(path);

    arrOfFileNames.forEach( (fileName) => {
        subDir.removeEntry(fileName);
    });
}