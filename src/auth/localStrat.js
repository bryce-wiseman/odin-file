import bcrypt from 'bcryptjs'
import LocalStrategy from 'passport-local'
import prisma from '../database/prismaClient.js'

export default new LocalStrategy( async(username, password, done) => {
    console.log('creating new LocalStrategy')
    try {
        const user = await prisma.user.findFirst(
            { where: {username} })
        if (!user) {
            console.log("Incorrect username")
            return done(null, false, {message: "Username not found"})
        }
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            console.log("Incorrect password")
            return done(null, false, {message: "Password is incorrect"})
        }
        console.log('user found')
        return done(null, user)
    } catch (error) {
        return done(error)
    }
})