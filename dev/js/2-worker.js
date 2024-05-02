
onmessage = (e) => {
    const data = e.data;

    //single file read
    //readFile(fileName).then( (obj) => {
        //postMessage(obj);
    //});


    //content writes
    writeFile(data.obj, data.fileName).then( () => {
        if (!data?.subDir) {
            postMessage("done file");
            return;
        }
        writeFileToSubDir(data.subDir).then( () => {
            postMessage("done new or edited record + file");
        });
    });
}

function prepFileContent(obj) {
    const str = JSON.stringify(obj);
    const textEncoder = new TextEncoder();

    return textEncoder.encode(str);
}
function convertFileContent(dataView) {
    const textDecoder = new TextDecoder();
    const str = textDecoder.decode(dataView);

    return JSON.parse(str);
}

async function deleteFile(fileName) {
    const opfsRoot = await navigator.storage.getDirectory();
    
    opfsRoot.removeEntry(fileName);
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

async function readFilesFromSubDir(arrOfFiles, path) {
    const opfsRoot = await navigator.storage.getDirectory();
    const subDir = opfsRoot.getDirectoryHandle(path);
    
    //TODO: for fileUid in arrOfFiles

    let recordFileHandle = await subDir.getFileHandle(fileUid);
    let recordAccessHandle = await recordFileHandle.createSyncAccessHandle();
    let size = recordAccessHandle.getSize();
    let dataView = new DataView(new ArrayBuffer(size));

    recordAccessHandle.read(dataView, {at: 0});
    recordAccessHandle.close();

    return convertFileContent(dataView);

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