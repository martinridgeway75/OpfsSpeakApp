
onmessage = (e) => {
    const data = e.data;

    //content writes
    writeFile(data.obj, data.fileName).then( () => {
        if (!data?.subDir) {
            postMessage("idx done");
            return;
        }
        writeFileToSubDir(data.subDir).then( () => {
            postMessage(" ++ new file");
        });
    });
};

function prepFileContent(obj) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();

    return textEncoder.encode(str);
}
async function writeFileToSubDir(subDir) {
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