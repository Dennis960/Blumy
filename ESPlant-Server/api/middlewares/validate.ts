import { RequestHandler } from "express";
import { AnyZodObject } from "zod";

const validate =
  (schema: AnyZodObject): RequestHandler =>
  async (req, res, next) => {
    try {
      req.body = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      res.status(400).json({ error });
    }
  };

export default validate;
