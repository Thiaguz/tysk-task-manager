import knex from "../database";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "src/interfaces/user";
import Auth from "../auth";

export default class UserController {
    static async index(req: Request, res: Response, next: NextFunction) {
        const { username } = req.params;
        const { page = 1, perPage = 5 } = req.query;

        try {
            let results: Array<User>;
            if (username) {
                results = await knex("users")
                    .select(["id", "username"])
                    .where({ username });
            } else {
                results = await knex("users")
                    .select(["id", "username"])
                    .limit(parseInt(perPage as string))
                    .offset(
                        (parseInt(page as string) - 1) *
                            parseInt(perPage as string)
                    )
                    .orderBy("id", "asc");
            }

            if (results.length >= 1) res.json(results);
            else next({ status: 404, message: "User not found" });
        } catch (error) {
            console.log(error.message);
            next({ status: 400 });
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            let { username, password } = req.body;

            if ((await knex("users").where({ username })).length >= 1) {
                next({ status: 409, message: "User already exists" });
            } else {
                password = bcrypt.hashSync(password, 10);

                await knex("users").insert({
                    username,
                    password,
                });

                const user = await knex("users").where({ username, password }).select(["id", "username", "password"]);

                res.status(201).json({
                    token: Auth.createToken(user[0]),
                    user: { id: user[0].id, username },
                });
            }
        } catch (error) {
            console.log(error.message);
            next({ status: 500 });
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = res.locals.user;
            const { username, password } = req.body;

            const user = await knex("users")
                .where({ id })
                .select(["id", "username"]);

            if (user.length >= 1) {
                if (
                    username &&
                    (
                        await knex("users")
                            .where({ username })
                            .select(["id", "username"])
                    ).length >= 1
                ) {
                    next({
                        status: 409,
                        message: "User with this username already exists",
                    });
                } else {
                    const newUser: User = {};
                    if (username) newUser.username = username;
                    if (password)
                        newUser.password = bcrypt.hashSync(password, 10);

                    await knex("users").update(newUser).where({ id });

                    res.json({ old: user[0] });
                }
            } else {
                next({ status: 404, message: "User not found" });
            }
        } catch (error) {
            console.log(error.message);
            next();
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = res.locals.user;
            if ((await knex("users").where({ id })).length >= 1) {
                await knex("users").where({ id }).del();
                res.send();
            } else {
                next({ status: 404, message: "User not found" });
            }
        } catch (error) {
            console.log(error.message);
            next();
        }
    }
}
