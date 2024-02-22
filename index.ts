// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import express, {Application, Express, Request, Response} from 'express';
import { setDatastore } from './lib/database';
const PORT = process.env.PORT || 8080;
const app: Application = express();

app.use(express.json());

// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();
setDatastore(datastore);
import { dynamicComponentRouter } from './lib/routes/dynamic-component';

app.use('/dynamic-component', dynamicComponentRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('🎉 Hello TypeScript! 🎉');
});

function printAvailableAPIs() {
  console.log('Available APIs:');
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods)} -> ${middleware.route.path}`);
    }
  });
}

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  printAvailableAPIs();
});

module.exports = server;
