import knex from '../database';
import { Request, Response, NextFunction } from 'express';
import Project from 'src/interfaces/project';

export default class ProjectController {
    static async index(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { user_id: target_user_id, id } = req.params;

            const { id: user_id } = res.locals.user;
            // TODO: Implements permission system
            if (user_id != target_user_id)
                return next({
                    status: 401,
                    message: "You don't have permission",
                });

            const query = knex('projects');

            if (id) {
                query.where({ user_id, id });
            } else {
                query.where({ user_id });
            }

            const results: Array<Project> = await query.orderBy('id');

            res.json(results);
        } catch (error) {
            console.log(error.message);
            next({ status: 400 });
        }
    }

    static async create(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { title, description } = req.body;
            const { id: user_id } = res.locals.user;

            const result = await knex('projects')
                .insert({
                    title,
                    description,
                    user_id,
                })
                .returning('*');

            // To support RETURNING
            const project =
                typeof result === 'object'
                    ? result
                    : await knex('projects').where({ id: result });

            !res.finished &&
                res
                    .status(201)
                    .send(project.length >= 1 ? project[0] : project);
        } catch (error) {
            console.log(error.message);
            next({});
        }
    }

    static async update(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id, user_id: target_user_id } = req.params;
            const { title, description } = req.body;

            const { id: user_id } = res.locals.user;
            // TODO: Implements permission system
            if (user_id != target_user_id)
                return next({
                    status: 401,
                    message: "You don't have permission",
                });

            const oldProject = await knex('projects').where({ id });

            if (oldProject.length >= 1) {
                const result = await knex('projects')
                    .update({ title, description })
                    .where({ id, user_id })
                    .returning('*');

                // To support RETURNING
                const project =
                    typeof result === 'object'
                        ? result
                        : await knex('projects').where({ id: result });

                !res.finished &&
                    res.status(200).send({
                        new: project.length >= 1 ? project[0] : project,
                        old: oldProject,
                    });
            } else {
                next({ status: 404, message: 'Project not found' });
            }
        } catch (error) {
            console.log(error.message);
            next({});
        }
    }

    static async delete(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const { id: user_id } = res.locals.user;

            const project = await knex('projects').where({ id, user_id });
            if (project.length >= 1) {
                await knex('projects').where({ id, user_id }).del();
                res.sendStatus(200).json(project);
            } else {
                next({ status: 404, message: 'Project not found' });
            }
        } catch (error) {
            console.log(error.message);
            next({});
        }
    }
}
