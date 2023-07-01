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
  res.superjson = function (data) {
    res.setHeader("Content-Type", "application/json");
    return res.send(SuperJSON.stringify(data));
  };
  next();
};

export default middleware;
