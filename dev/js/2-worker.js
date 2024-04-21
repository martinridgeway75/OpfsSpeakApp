onmessage = function(e) {

//TODO: fileName & path also come from main thread

    writeToOpfs(e.data, "assessments").then( () => {
        postMessage(e.data);
    });    
}

//NOTE: obj is always an object
async function writeToOpfs(obj, fileName, path) {
    const opfsRoot = await navigator.storage.getDirectory();

//TODO: get dir

    const fileHandle = await opfsRoot.getFileHandle(fileName, {create: true});

    const accessHandle = await fileHandle.createSyncAccessHandle();
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();
    const content = textEncoder.encode(str);

    accessHandle.truncate(0);
    accessHandle.write(content, {at: 0});
    accessHandle.flush();
    accessHandle.close();
}