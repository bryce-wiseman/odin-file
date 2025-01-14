import { Router } from 'express';
import tryCatch from '../utils/tryCatch.js';
import upload from '../config/multer.js';
import indexController from '../controllers/indexController.js'
import userController from '../controllers/userController.js';
import filesController from '../controllers/filesController.js';

const router = Router()

router.get('/', tryCatch(indexController.getIndex));

router.get('/sign-up', tryCatch(indexController.getSignUp));

router.get('/log-in', tryCatch(indexController.getLogIn));

router.get('/home', tryCatch(indexController.getMyStorage));

router.post('/sign-up', userController.postCreateUser);

router.post('/log-in', tryCatch(userController.postLogUser));

router.get('/logout', tryCatch(userController.getLogOutUser));

// file handler
router.get('/home/file/:fileId', tryCatch(indexController.getFile));

router.post('/home/uploadfile/:folderId', upload.array('files', 10), tryCatch(filesController.postCreateFile));

router.post('/deleteFile/:fileId', tryCatch(filesController.postDeleteFile));

router.post('/updateFileName/:fileId', tryCatch(filesController.postUpdateFileName));

router.post('/updateFileLocation/:fileId', tryCatch(filesController.postUpdateFileLocation));

// folder handler
router.get('/home/folder/:folderId', tryCatch(indexController.getFolder))

router.post('/createFolder/:parentId', tryCatch(filesController.postCreateFolder));

router.post('/deleteFolder/:folderId', tryCatch(filesController.postDeleteFolder));

router.post('/updateFolderName/:folderId', tryCatch(filesController.postUpdateFolderName));

router.post('/updateFolderLocation/:folderId', tryCatch(filesController.postUpdateFolderLocation));

export default router;