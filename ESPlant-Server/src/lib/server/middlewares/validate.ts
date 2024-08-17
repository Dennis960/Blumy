import { RequestHandler } from "express";
import { AnyZodObject } from "zod";

const validate =
  (schema: AnyZodObject): RequestHandler =>
  async (req, res, next) => {
    try {
      const sanitizedReq = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = sanitizedReq.body;
      req.query = sanitizedReq.query;
      req.params = sanitizedReq.params;
      return next();
    } catch (error) {
      res.status(400).json({ error });
    }
  };

export default validate;
