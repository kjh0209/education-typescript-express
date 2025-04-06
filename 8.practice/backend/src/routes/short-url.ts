import express, { Request, Response } from "express";
import { IMappingTable, mappingTableSchema } from "@shared/schema";
import { z } from "zod";
const shortUrlRouter = express.Router();
const mappingTable: IMappingTable = {};
const urlSchema = z.object({
  originalURL: z.string().url()
});

shortUrlRouter.post("/", (req: Request, res: Response) => {
  try {
    const urlSchema = z.object({
      originalURL: z.string().url()
    });
    const parseResult = urlSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid or missing 'url' field" });
      return;
    }

    const { originalURL } = parseResult.data;

    let shortCode: string;
    do {
      shortCode = Math.random().toString(36).substring(2, 8); // 예: "4f3ca9"
    } while (mappingTable[shortCode]);

    mappingTable[shortCode] = {
      originalUrl: originalURL,
      visits: 0
    };

    res.json({ shortCode });
  } catch (error) {
    console.error("Failed to generate short code:", error);
    res.status(500).json({ error: "Failed to generate short code" });
  }
});

shortUrlRouter.get("/stats", (req: Request, res: Response) => {
  const parseResult = mappingTableSchema.safeParse(mappingTable);

  if (!parseResult.success) {
      res.status(500).json({ error: "매핑 테이블 구조가 유효하지 않습니다." });
      return;
    }
  try {
    res.json(mappingTable);
  } catch (error) {
    console.error("Failed to parse mappingTable:", error);
    res.status(500).json({ error: "Failed to parse mappingTable" });
  }
});

shortUrlRouter.get("/", (req: Request, res: Response) => {
  try {
    const shortCode = req.query.shortCode as string;

    if (!shortCode || !mappingTable[shortCode]) {
      res.status(404).sendFile("404.html", { root: "public" });
      return;
    }

    mappingTable[shortCode].visits += 1;

    res.redirect(mappingTable[shortCode].originalUrl);
  } catch (error) {
    console.error("Failed to redirect:", error);
    res.status(500).json({ error: "Failed to redirect" });
  }
});

export default shortUrlRouter;
