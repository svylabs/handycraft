import express, {Router, Request, Response, NextFunction} from 'express';
import {getDatastore} from '../../database';
export const dynamicComponentRouter: Router = express.Router();
import { authenticatedUser } from '../auth';

dynamicComponentRouter.post('/new', authenticatedUser, async (req: Request, res: Response) => {
    const kind = 'DynamicComponent';
    const name =  req.body.title;
    const datastore = getDatastore();
    const key = datastore.key([kind, name]);
    const entity = {
        key: key,
        data: [
            {
                name: 'title',
                value: req.body.title
            },
            {
                name: 'description',
                value: req.body.description
            },
            {
                name: 'component_definition',
                value: req.body.component_definition
            },
            {
                name: 'image_url',
                value: req.body.image_url
            },
            {
                name: 'created_on',
                value: new Date().toISOString()
            },
            {
                name: 'approval_status',
                value: 'pending'
            }
        ]
    };
    await datastore.save(entity);
    res.send({status: 'success', message: 'Dynamic component created successfully', id: req.body.title});
});

dynamicComponentRouter.post('/approve', async (req: Request, res: Response) => {
    const datastore = getDatastore();
    const key = datastore.key(['DynamicComponent', req.body.id]);
    const [entity] = await datastore.get(key);
    if (entity) {
        entity.approval_status = 'approved';
        entity.approved_on = new Date().toISOString();
        await datastore.save({
            key: key,
            data: entity
        });
        res.send({status: 'success', message: 'Dynamic component approved successfully'});
    } else {
        res.send({status: 'error', message: 'Dynamic component not found'});
    }
});

dynamicComponentRouter.get('/list', async (req: Request, res: Response) => {
    const datastore = getDatastore();
    let query = datastore.createQuery('DynamicComponent');
    if (req.query.approval_status === undefined) {
      query = query.filter('approval_status', '=', 'approved');
    } else {
      query = query.filter('approval_status', '=', req.query.approval_status);
    }
    const [dynamicComponents] = await datastore.runQuery(query);
    res.send(dynamicComponents);
});