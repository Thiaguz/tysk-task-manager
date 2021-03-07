import express, { Router, Request, Response, NextFunction } from 'express';
import path from 'path';

import UserController from './controllers/UserController';
import ProjectController from './controllers/ProjectController';
import TaskController from './controllers/TaskController';
import AuthController from './controllers/AuthController';
import { HttpErrorHandler } from './@types';

const routes = Router();
const apiRoutes = Router();
routes.use('/api', apiRoutes);
apiRoutes.use(express.json());

// Static Files
routes.use(
    express.static(path.join(__dirname, '..', 'client', 'build'), {
        dotfiles: 'ignore',
        etag: true,
        extensions: ['htm', 'html'],
        index: 'index.html',
        lastModified: true,
        maxAge: '1d',
    })
);
routes.get('*', (_req: Request, res: Response) =>
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'))
);

// Api Routes
apiRoutes
    .get('/status', (_req, res) => {
        res.send({
            timestamp: Date.now(),
            uptime: process.uptime(),
        });
    })

    // TODO: Create a permission system
    // NOTE: Routes without `:user_id` (or `:id` in `/users`) don't use permission system

    // Users
    .get(['/users', '/users/:username'], UserController.index)
    .post('/users', UserController.create)
    .put('/users', AuthController.token, UserController.update)
    .delete('/users', AuthController.token, UserController.delete)

    // Projects
    .get(
        ['/users/:user_id/projects', '/users/:user_id/projects/:id'],
        AuthController.token,
        ProjectController.index
    )
    .post('/users/projects', AuthController.token, ProjectController.create)
    .put(
        '/users/:user_id/projects/:id',
        AuthController.token,
        ProjectController.update
    )
    .delete(
        '/users/projects/:id',
        AuthController.token,
        ProjectController.delete
    )

    // Tasks
    .get(
        '/users/:user_id/projects/:project_id/tasks',
        AuthController.token,
        TaskController.index
    )
    .post(
        '/users/:user_id/projects/:project_id/tasks',
        AuthController.token,
        TaskController.create
    )
    .put(
        '/users/:user_id/projects/:project_id/tasks/:id',
        AuthController.token,
        TaskController.update
    )
    .delete(
        '/users/:user_id/projects/:project_id/tasks/:id',
        AuthController.token,
        TaskController.delete
    )

    // Auth
    .post('/login', AuthController.index);

// Catch All Error's
apiRoutes.use(
    (
        { status = 500, message = 'Something went wrong' }: HttpErrorHandler,
        _req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
    ) =>
        !res.writableEnded &&
        res.status(status).json({
            status,
            // Capitalize message
            message: message[0].toUpperCase() + message.slice(1),
        })
);

export default routes;
