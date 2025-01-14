import db from "../db/queries.js";

const fileIcons = {
    IMAGE: '/icons/image.png',
    VIDEO: '/icons/video.png',
    DOCUMENT: '/icons/doc.png',
    AUDIO: '/icons/audio.svg',
    OTHER: '/icons/other.svg',
}

async function getIndex(req, res, next){
    if(res.locals.isAuth){
        return res.redirect('/home');
    }

    const feedback = req.session.feedback;
    delete req.session.feedback;
    
    res.render('index', {feedback});
}

async function getSignUp(req, res, next){
    if(res.locals.isAuth){
        return res.redirect('/home');
    }

    res.render('sign-up');
}

async function getLogIn(req, res, next){
    if(res.locals.isAuth){
        return res.redirect('/home');
    }
    const feedback = req.session.feedback;
    delete req.session.feedback;

    res.render('log-in', {feedback});
}

async function getMyStorage(req, res, next) {
    if(!res.locals.isAuth){
        return res.redirect('/');
    }
    const userId = res.locals.currentUser.id;
    const feedback = req.session.feedback;
    delete req.session.feedback;

    const folder = await db.getMainFolder(userId);
    const allFolders = await db.getAllUserFolders(userId);


    /* console.log('HOME DATA', {
        folderId: folder.id,
        files: folder.files,
        subfolders: folder.subfolders, 
        folderName: folder.name,
        allFolders,
        fileIcons,
        feedback 
    }) */

    res.render('home', { 
        folderId: folder.id,
        files: folder.files,
        subfolders: folder.subfolders, 
        folderName: folder.name,
        allFolders,
        fileIcons,
        feedback 
    });
}

async function getFolder(req, res, next){
    if(!res.locals.isAuth){
        return res.redirect('/');
    }
    const feedback = req.session.feedback;
    delete req.session.feedback;

    const ownerId = res.locals.currentUser.id;
    console.log(req.params.folderId)
    let folderId = parseInt(req.params.folderId);

    const folder = await db.getFolderById(folderId, ownerId);
    const allFolders = await db.getAllUserFolders(ownerId);

    console.log('FOLDER DATA', {
        folderId: folder.id,
        files: folder.files,
        subfolders: folder.subfolders, 
        folderName: folder.name,
        allFolders,
        fileIcons,
        feedback 
    })

    res.render('home', { 
        folderId: folder.id,
        files: folder.files,
        subfolders: folder.subfolders, 
        folderName: folder.name,
        allFolders,
        fileIcons,
        feedback  
    });
}

async function getFile(req, res, next){
    if(!res.locals.isAuth){
        return res.redirect('/');
    }

    const ownerId = res.locals.currentUser.id;
    const fileId = parseInt(req.params.fileId);
    let isOwner = false;

    const file = await db.getFileById(fileId);
    const user = await db.getUserById(ownerId);
    const allFolders = await db.getAllUserFolders(ownerId);

    user.folders.forEach(folder => {
     if(folder.id === file.folderId){
         isOwner = true
     }
    });

    if(!isOwner) return res.redirect('/home');

    res.render('file', {
        file,
        fileIcons,
        allFolders
    });
}

const indexController = {
    getIndex,
    getSignUp,
    getLogIn,
    getMyStorage,
    getFolder,
    getFile
};

export default indexController;