import express, { Application, NextFunction, Request, Response } from 'express';
const {Datastore} = require('@google-cloud/datastore');
const {DatastoreStore} = require('@google-cloud/connect-datastore');
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv'; //comment
import 'dotenv/config';
import { setDatastore, getDatastore } from './lib/database';
import path from 'path';

dotenv.config(); //comment

const PORT = process.env.PORT || 8080;
const app: Application = express();

app.use(cors());
app.use(express.json());

app.use(session({
  store: new DatastoreStore({
    kind: 'express-sessions',

    // Optional: expire the session after this many milliseconds.
    // note: datastore does not automatically delete all expired sessions
    // you may want to run separate cleanup requests to remove expired sessions
    // 0 means do not expire
    expirationMs: 0,

    dataset: new Datastore({

      // For convenience, @google-cloud/datastore automatically looks for the
      // GCLOUD_PROJECT environment variable. Or you can explicitly pass in a
      // project ID here:
      projectId: process.env.GCLOUD_PROJECT,

      // For convenience, @google-cloud/datastore automatically looks for the
      // GOOGLE_APPLICATION_CREDENTIALS environment variable. Or you can
      // explicitly pass in that path to your key file here:
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    })
  }),
  secret: process.env.SESSION_SECRET || 'local-secret',
  resave: false,
  saveUninitialized: false,
}));

// Creates a client
const datastore = new Datastore();
setDatastore(datastore);

import { dynamicComponentRouter } from './lib/routes/dynamic-component';
import { HttpError, githubRouter } from './lib/routes/auth';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle the error
  if (err instanceof HttpError) {
    res.status((err as HttpError).status || 500);
  } else {
    res.status(500);
  }
  res.json({
    error: {
      message: err.message
    }
  });
};

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you can throw the error to crash the process
  // throw reason;
});

app.use(errorHandler);
app.use(express.static('public'));
app.use('/dynamic-component', dynamicComponentRouter);
app.use('/auth', githubRouter);

app.get('/', function(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/converter/*', function(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  //printAvailableAPIs();
});

console.log(process.env.NODE_ENV)
export = server;
