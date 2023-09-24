import { RequestHandler } from "express";
import SuperJSON from "superjson";

declare global {
  namespace Express {
    export interface Response {
      superjson: (data: any) => Express.Response;
    }
  }
}

// use superjson to encode JSON responses
const middleware: RequestHandler = (req, res, next) => {
  if (req.is("json")) {
    try {
      req.body = SuperJSON.deserialize(req.body);
    } catch (error) {
      return res.status(400).json({ error: "Invalid request body" });
    }
  }
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    res.setHeader("Content-Type", "application/json");
    return originalJson(SuperJSON.serialize(data));
  };
  next();
};

export default middleware;
