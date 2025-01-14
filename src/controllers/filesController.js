import fs from 'node:fs';
import db from "../db/queries.js";
import clearAll from "../utils/clearAll.js";
import Errors from '../utils/customError.js';
import multer from 'multer';
const documents = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

async function postCreateFolder(req, res, next){
    const ownerId = res.locals.currentUser.id;
    const parentId = parseInt(req.params.parentId);
    const { foldername } = req.body;

    if(!foldername) return next(new Errors.customError('Error creating new folder: Folder does not have name', 400));

    await db.createFolder(foldername, parentId, ownerId);

    req.session.feedback = `Created Folder: ${foldername}`;

    const referer = req.get('Referer');
    res.redirect(referer);
}

async function postDeleteFolder(req, res, next){
    const ownerId = res.locals.currentUser.id;
    const folderId = parseInt(req.params.folderId);

    await clearAll(folderId, ownerId);

    req.session.feedback = 'Folder sucessfully deleted!';

    const referer = req.get('Referer');
    res.redirect(referer);
}

async function postUpdateFolderName(req, res, next){
    const ownerId = res.locals.currentUser.id;
    const folderId = parseInt(req.params.folderId);
    const { newName } = req.body;

    await db.updateFolderName(newName, folderId, ownerId);

    const referer = req.get('Referer');
    res.redirect(referer);
}

async function postUpdateFolderLocation(req, res, next){
    const ownerId = res.locals.currentUser.id;
    const folderId = parseInt(req.params.folderId);
    const newParentId = parseInt(req.body.newParentId);

    await db.updateFolderLocation(newParentId, folderId, ownerId);

    req.session.feedback = 'Folder Sucessfully moved';

    const referer = req.get('Referer');
    res.redirect(referer);
}

async function postCreateFile(req, res, next) {
    const folderId = parseInt(req.params.folderId);
    let feedError = false;

    const processedFiles = await Promise.all(
        req.files.map(async (file) => {
            try{
                let type = 'raw';

                if (file.mimetype.includes('image')) type = 'IMAGE';
                if (file.mimetype.includes('video') || file.mimetype.includes('audio')) type = 'VIDEO';
               
                fs.unlink(file.path, (err) => {
                    if(err){
                        return next(new Errors.customError('Error deleting file on fs', 500));
                    }
                });


                return {
                    fileName: file.originalname,
                    filePath: file.path,
                    fileURL: file.destination,
                    fileDisplay: file.originalname,
                    fileType: file.mimetype.includes('image')
                    ? 'IMAGE'
                    : file.mimetype.includes('video')
                    ? 'VIDEO'
                    : file.mimetype.includes('audio')
                    ? 'AUDIO'
                    : documents.includes(file.mimetype)
                    ? 'DOCUMENT'
                    : 'OTHER',
                    fileSize: file.size,
                    error: null
                }

            }catch(err) {
                console.error(`Error Uploading File ${file.originalName}: ${err.message}`);
                return {
                    originalName: file.originalName,
                    error: `Error Uploading File ${file.originalName}`
                }
            }
        })
    );

    const successFiles = processedFiles.filter(file => !file.error);
    const failedFiles = processedFiles.filter(file => file.error);

    if (failedFiles.length > 0) {
        console.warn('Some files didnt upload correctly:', failedFiles);
        req.session.feedback = `Some files didnt upload correctly: ${failedFiles}`;
        feedError = true;
    }

    const promises = successFiles.map(async (file) => {
        try{
            await db.createFile(
                file.fileName,
                file.filePath,
                file.fileURL,
                file.fileDisplay,
                file.fileType,
                file.fileSize,
                folderId
            )

        } catch(err){
            console.error(`Error saving File ${file.originalName} on DB: ${err.message}`);
            req.session.feedback = `Error saving File ${file.originalName} on DB: ${err.message}`;
            feedError = true;

            let type = 'raw';

            if (file.type === 'IMAGE') type = 'image';
            if (file.type === 'VIDEO' || file.type === 'AUDIO') type = 'video';

            
        }
    }
    );

    await Promise.all(promises);

    if(!feedError) req.session.feedback = 'Files uploaded Sucessfully!';

    const referer = req.get('Referer');
    res.redirect(referer);
}

async function postDeleteFile(req, res, next){
    const fileId = parseInt(req.params.fileId);
    const delFile = await db.getFileById(fileId);
    
    try {
        // delete from the cloud storage
        let type = 'raw';
    
        if (delFile.fileType.includes('IMAGE')) type = 'image';
        if (delFile.fileType.includes('VIDEO') || delFile.fileType.includes('AUDIO')) type = 'video';
    

        //delete from db
        await db.deleteFile(fileId);

    } catch(err) {
        return next(new Errors.customError(`Error Deleting the file: ${delFile.name}`, 500));
    }

    req.session.feedback = `File: ${delFile.name} sucessfully deleted!`;

    const referer = req.get('Referer');
    res.redirect(referer);
}

async function postUpdateFileName(req, res, next){
    const fileId = parseInt(req.params.fileId);
    const { newFileName } = req.body;

    await db.updateFileName(fileId, newFileName);

    const referer = req.get('Referer');

    res.redirect(referer);
}

async function postUpdateFileLocation(req, res, next){
    const fileId = parseInt(req.params.fileId);
    const newFolderId = parseInt(req.body.newFolderId);

    await db.updateFileLocation(fileId, newFolderId);

    const referer = req.get('Referer');

    res.redirect(referer);
}

const filesController = {
    postCreateFile,
    postDeleteFile,
    postCreateFolder,
    postDeleteFolder,
    postUpdateFolderName,
    postUpdateFolderLocation,
    postUpdateFileName,
    postUpdateFileLocation
}

export default filesController;