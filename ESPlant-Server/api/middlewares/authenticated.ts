import { RequestHandler } from "express";
import SensorRepository from "../repositories/SensorRepository.js";

export const isAuthenticated: RequestHandler = (req, res, next) => {
  console.log("isAuthenticated", req.user)
  if (!req.isAuthenticated()) {
    return res.status(401).send({
      message: "unauthorized",
    });
  }
  return next();
};

export const isUser: RequestHandler = (req, res, next) => {
  console.log("isUser", req.user)
  if (req.user?.kind != "user") {
    return res.status(403).send({
      message: "unauthorized",
    });
  }
  return next();
};

export const isSensor: RequestHandler = (req, res, next) => {
  if (req.user?.kind != "sensor") {
    return res.status(403).send({
      message: "unauthorized",
    });
  }
  return next();
};

export const isOwner: RequestHandler = async (req, res, next) => {
  if (req.params.sensorId == undefined) {
    throw new Error(
      "Illegal usage of isOwner middleware - sensorId parameter missing"
    );
  }

  const sensorId = parseInt(req.params.sensorId);
  const ownerId = await SensorRepository.getOwner(sensorId);
  if (ownerId == undefined) {
    return res.status(404).send({
      message: "sensor not found",
    });
  }

  if (req.user?.userId != ownerId) {
    return res.status(403).send({
      message: "unauthorized",
    });
  }
  return next();
};
