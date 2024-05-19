
onmessage = (e) => {
    const data = e.data;

    if (!data?.subDir) {
        writeFile(data.obj, data.fileName).then( () => {
            postMessage("OK");
        });
        return;
    }
    writeToSubDir(data.subDir).then( () => {
        writeFile(data.obj, data.fileName).then( () => {
            postMessage("OK");
        });
    });    
};

function prepFileContent(obj) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();

    return textEncoder.encode(str);
}

async function writeToSubDir(subDir) {
    if (subDir?.fileUidsArr) {
        writeRecordFilesToSubDir(subDir.obj, subDir.path, subDir.fileUidsArr); //subDir.obj is an [] of {}s
    } else {
        writeOneFileToSubDir(subDir.obj, subDir.path, subDir.fileUid);
    }
}

//TODO: compare this with the Promise.all method (ref: rubricData)
async function writeRecordFilesToSubDir(subDir) {
    const arrOfObjs = subDir.fileUidsArr;

    arrOfObjs.forEach( async (obj, i) => {
        await writeOneFileToSubDir(subDir.obj[i], subDir.path, subDir.fileUidsArr[i]);
    });
}

async function writeOneFileToSubDir(obj, path, fileUid) {
    try {
        const content = prepFileContent(obj);
        const opfsRoot = await navigator.storage.getDirectory();
        const opfsSubDir = await opfsRoot.getDirectoryHandle(path, { create: true });
        const recordFileHandle = await opfsSubDir.getFileHandle(fileUid, {create: true});
        const recordAccessHandle = await recordFileHandle.createSyncAccessHandle();

        recordAccessHandle.truncate(0);
        recordAccessHandle.write(content, {at: 0});
        recordAccessHandle.flush();
        recordAccessHandle.close();
    } catch (e) {
        postMessage( (e).toString() );
    }
}
async function writeFile(obj, fileName) {
    try {
        const content = prepFileContent(obj);
        const opfsRoot = await navigator.storage.getDirectory();
        const idxFileHandle = await opfsRoot.getFileHandle(fileName, {create: true});
        const idxAccessHandle = await idxFileHandle.createSyncAccessHandle();

        idxAccessHandle.truncate(0);
        idxAccessHandle.write(content, {at: 0});
        idxAccessHandle.flush();
        idxAccessHandle.close();
    } catch (e) {
        postMessage( (e).toString() );
    }
}