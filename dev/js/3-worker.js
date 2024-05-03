
onmessage = (e) => {
    const data = e.data;

    //single file read
    readFile(fileName).then( (obj) => {
        postMessage(obj);
    });
}

function convertFileContent(dataView) {
    const textDecoder = new TextDecoder();
    const str = textDecoder.decode(dataView);

    return JSON.parse(str);
}

async function readFile(fileName) {
    const opfsRoot = await navigator.storage.getDirectory();
    const idxFileHandle = await opfsRoot.getFileHandle(fileName);
    const idxAccessHandle = await idxFileHandle.createSyncAccessHandle();
    const size = idxAccessHandle.getSize();
    const dataView = new DataView(new ArrayBuffer(size));

    idxAccessHandle.read(dataView, {at: 0});
    idxAccessHandle.close();

    return convertFileContent(dataView);
}

//TODO: is it possible to pass the handle?
async function readOneFileFromSubDir(fileName, subDir) {
    let recordFileHandle = await subDir.getFileHandle(fileName);
    let recordAccessHandle = await recordFileHandle.createSyncAccessHandle();
    let size = recordAccessHandle.getSize();
    let dataView = new DataView(new ArrayBuffer(size));

    recordAccessHandle.read(dataView, {at: 0});
    recordAccessHandle.close();

    return convertFileContent(dataView);
}


async function readFilesFromSubDir(arrOfFileNames, path) {
    const opfsRoot = await navigator.storage.getDirectory();
    const subDir = opfsRoot.getDirectoryHandle(path);

    let tempArr = arrOfFileNames.map( (fileName) => {
        return readOneFileFromSubDir(fileName, subDir);
    });
    let arrOfObjs = Promise.all( tempArr );

    return arrOfObjs;
}







// async function deleteFile(fileName) {
//     const opfsRoot = await navigator.storage.getDirectory();
    
//     opfsRoot.removeEntry(fileName);
// }