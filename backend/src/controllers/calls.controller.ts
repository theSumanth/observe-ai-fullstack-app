import { Request, Response, NextFunction } from "express";
import { IngestCallSchema } from "../types";
import * as callsService from "../services/calls.service";

export async function postCall(req: Request, res: Response, next: NextFunction) {
  try {
    const body = IngestCallSchema.parse(req.body);
    const result = await callsService.ingestCall(body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export function getCalls(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.query.agent;
    const agent = typeof raw === "string" ? raw : undefined;
    res.json(callsService.listCalls(agent));
  } catch (err) {
    next(err);
  }
}

export function getCallById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    res.json(callsService.getCall(id));
  } catch (err) {
    next(err);
  }
}

export function getCallMoments(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(callsService.getCallMoments(String(req.params.id)));
  } catch (err) {
    next(err);
  }
}
