import url from 'url'
import path from 'path'
import express from 'express'
import expressSession from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { PrismaClient } from '@prisma/client'
import  router from './src/auth/router.js'
import passport from './src/config/passportConfig.js'
import prisma from './src/db/prismaClient.js'
import pgSession from 'connect-pg-simple'
import pkg from 'pg'
const { Pool } = pkg

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.set("views", __dirname + "/src/views")
app.set("view engine", "ejs")

const pgPool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: {rejectUnauthorized: false}
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(__dirname + '/public'))

app.use(
    expressSession({
      cookie: {
       maxAge: 7 * 24 * 60 * 60 * 1000 // ms
      },
      secret: 'a santa at nasa',
      resave: true,
      saveUninitialized: true,
      store: new PrismaSessionStore(
        new PrismaClient(),
        {
          checkPeriod: 2 * 60 * 1000,  //ms
          dbRecordIdIsSessionId: true,
          dbRecordIdFunction: undefined,
        }
      )
    })
  );
  
  
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.isAuth = req.isAuthenticated();
    next();
  });
app.use((req, res, next) => {
    console.log(res.locals.currentUser);
    console.log(res.locals.isAuth);
    next();
  });

app.use("/", router)



app.listen(3000, () => console.log("app listening on port 3000"))