import { NextFunction, Request, Response } from "express";
import { create } from "xmlbuilder2";
import { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (result.success) {
      return next();
    } else {
      if (req.headers["accept"] == "application/xml") {
        const root = create().ele("errors", { message: "Validation failed" });
        result.error.issues.forEach((issue) => {
          root.ele("error", {
            path: issue.path.join(": "),
            message: issue.message,
          });
        });
        return res.status(400).send(root.end({ prettyPrint: true }));
      } else {
        return res.status(400).json({
          message: "Validation failed",
          details: result.error.issues.map((issue) => {
            return {
              path: issue.path.join(": "),
              message: issue.message,
            };
          }),
        });
      }
    }
  };
