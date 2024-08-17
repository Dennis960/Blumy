import { RequestHandler } from "express";
import SensorRepository from "../repositories/SensorRepository.js";

export const isUser: RequestHandler = (req, res, next) => {
  if (req.user == undefined) {
    return res.status(401).send({
      message: "not authenticated",
    });
  }

  if (req.user?.kind != "user") {
    return res.status(403).send({
      message: "user not logged in",
    });
  }

  return next();
};

export const isSensorWrite: RequestHandler = (req, res, next) => {
  if (req.user == undefined) {
    return res.status(401).send({
      message: "not authenticated",
    });
  }

  if (req.user?.kind != "sensor-write") {
    return res.status(403).send({
      message: "missing write token",
    });
  }

  return next();
};

export const isOwner: RequestHandler = async (req, res, next) => {
  if (req.user == undefined) {
    return res.status(401).send({
      message: "not authenticated",
    });
  }

  if (req.user?.kind != "user") {
    return res.status(403).send({
      message: "user not logged in",
    });
  }

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
      message: "not an owner of this sensor",
    });
  }

  return next();
};

export const isOwnerOrThisSensorRead: RequestHandler = async (req, res, next) => {
  if (req.user == undefined) {
    return res.status(401).send({
      message: "not authenticated",
    });
  }

  if (req.params.sensorId == undefined) {
    throw new Error(
      "Illegal usage of isOwnerOrSensorRead middleware - sensorId parameter missing"
    );
  }

  const sensorId = parseInt(req.params.sensorId);

  if (req.user?.kind == "sensor-read") {
    if (req.user?.sensorId != sensorId) {
      return res.status(403).send({
        message: "wrong sensor for read token",
      });
    }

    return next();
  }

  if (req.user?.kind == "user") {
    const ownerId = await SensorRepository.getOwner(sensorId);
    if (ownerId == undefined) {
      return res.status(404).send({
        message: "sensor not found",
      });
    }

    if (req.user?.userId != ownerId) {
      return res.status(403).send({
        message: "not an owner of this sensor",
      });
    }

    return next();
  }

  return res.status(403).send({
    message: "not authenticated",
  });
};
