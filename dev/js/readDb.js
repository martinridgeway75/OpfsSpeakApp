
onmessage = (e) => {
    const data = e.data;

    if (!data?.subDir) {
        readFile(data.fileName);
        return;
    }
    readFilesFromSubDir(data.subDir.fileUidsArr, data.subDir.path);
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
    postMessage(convertFileContent(dataView));
}
async function readOneFileFromSubDir(fileName, path) {
    const opfsRoot = await navigator.storage.getDirectory();
    const subDir = await opfsRoot.getDirectoryHandle(path);
    const recordFileHandle = await subDir.getFileHandle(fileName);
    const recordAccessHandle = await recordFileHandle.createSyncAccessHandle();
    const size = recordAccessHandle.getSize();
    const dataView = new DataView(new ArrayBuffer(size));

    recordAccessHandle.read(dataView, {at: 0});
    recordAccessHandle.close();

    return convertFileContent(dataView);
}
async function readFilesFromSubDir(arrOfFileNames, path) {
    const mappedArr = arrOfFileNames.map( async (fileName) => {
        return await readOneFileFromSubDir(fileName, path);
    });
    Promise.all( mappedArr ).then( (arrOfObjs) => {
        postMessage(arrOfObjs);
    });
}