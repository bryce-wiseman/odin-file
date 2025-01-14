import { validationResult } from "express-validator";
import validations from "../config/validatorConfig.js";
import bcrypt from 'bcryptjs';
import passport from "../config/passportConfig.js";
import db from "../db/queries.js";
import tryCatch from '../utils/tryCatch.js';
import Errors from '../utils/customError.js';

const postCreateUser = [
    validations.validateCreateUser,
    tryCatch(
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()){
            res.status(400).render('sign-up', {
                errors: validationErrors.array()
            });
            return;
        }

        const { email, password } = req.body;

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if(err) {
                return next(new Errors.customError('Error creating user, please try again', 500));
            }

            await db.createUser(email, hashedPassword);
            req.session.feedback = 'User created successfully!';
            
            res.redirect('/log-in');
        });
    })
]

const postLogUser = passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/log-in'
});

const getLogOutUser = (req, res, next) => {
    if(!res.locals.isAuth){
        return res.redirect('/');
    }

    req.logout((err) => {
        if(err) return next(new Errors.customError('Error logging Out, try again', 500));
        req.session.feedback = 'Logged Out successfully';

        res.redirect('/');
    })
}

const userController = {
    postCreateUser,
    postLogUser,
    getLogOutUser
}

export default userController;