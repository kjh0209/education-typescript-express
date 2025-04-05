import {} from "@shared/schema";
import { Router, Request, Response } from "express";
import { z } from 'zod';

const liveClockRouter = Router();

liveClockRouter.post("/", async (req: Request, res: Response) => { //express는 post에 넘기는 핸들러의 타입을 void | Promise<void>로 기대함. -> 뭐 리턴하면 안 됨.
  try {
    const bodySchema = z.object({
      url: z.string().url(),
    });

    const parseResult = bodySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid or missing 'url' field" });
      return;
    }

    const { url } = parseResult.data;

    const response = await fetch(url, { method: "GET", redirect: "manual" });

    const serverTime = response.headers.get("Date");

    const responseSchema = z.object({
      serverTime: z.string().nullable(),
    });

    const validatedResponse = responseSchema.parse({ serverTime });

    res.json(validatedResponse);

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default liveClockRouter;
