onmessage = function(e) {

    //write to the subdir (create file) and update the idx file 
    




    write2ToOpfs(e.data, "assessments").then( () => {
        postMessage(e.data);
    });
}

//for 'puts' to records and rubrics
async function write2ToOpfs(obj, idxFileUid, dirName) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();
    const content = textEncoder.encode(str);

    const opfsRoot = await navigator.storage.getDirectory();

    const idxFileHandle = await opfsRoot.getFileHandle(idxFileUid, {create: true}); //TODO: don't allow create here, need a startup check .exists()
    const idxAccessHandle = await idxFileHandle.createSyncAccessHandle();

    idxAccessHandle.truncate(0);
    idxAccessHandle.write(content, {at: 0});
    idxAccessHandle.flush();
    idxAccessHandle.close();

    const subDir = opfsRoot.getDirectoryHandle(dirName, { create: true });  //TODO: don't allow create here, need a startup check .exists()
    const recordFileHandle = await subDir.getFileHandle(idxFileUid, {create: true}); //create true needed here
    const recordAccessHandle = await recordFileHandle.createSyncAccessHandle();

    recordAccessHandle.truncate(0);
    recordAccessHandle.write(content, {at: 0});
    recordAccessHandle.flush();
    recordAccessHandle.close();
}

//for 'puts' to studentData and snippets
async function write1ToOpfs(obj, idxFileUid) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();
    const content = textEncoder.encode(str);

    const opfsRoot = await navigator.storage.getDirectory();
    const idxFileHandle = await opfsRoot.getFileHandle(idxFileUid, {create: true}); //TODO: don't allow create here, need a startup check .exists()
    const idxAccessHandle = await idxFileHandle.createSyncAccessHandle();

    idxAccessHandle.truncate(0);
    idxAccessHandle.write(content, {at: 0});
    idxAccessHandle.flush();
    idxAccessHandle.close();
}