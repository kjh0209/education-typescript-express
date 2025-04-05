import express, { Request, Response } from "express";
import catRouter from "./routes/cat";
import shortUrlRouter from "./routes/short-url";
import liveClockRouter from "./routes/live-clock";
import cors, { CorsOptions } from "cors";
import { authMiddleWare } from "./middlewares/auth";
import path from "path";
import ssrRouter from "./routes/ssr";
import { PORT } from "./config";
import "module-alias/register";
import { allowCorsHeaders } from "./middlewares/cors";
import csrRouter from "./routes/csr";

const app = express();

//CORS 설정
const whitelist = [`http://localhost:3000`,`http://localhost:3001`, "https://edu.techceo.kr"];
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions)); // CORS 미들웨어 추가(모든 경로에 대해 전역 적용)
app.use(express.json()); // JSON 파싱하는 미들웨어 추가 (모든 경로에 대해 전역 적용)
app.use(allowCorsHeaders); // 노출 되는 응답 헤더 늘려주는 미들웨어 추가 (모든 경로에 대해 전역 적용)

// app.get("/cat", authMiddleWare, (req: Request, res: Response) => {
//   res.send("GET, It's a cute cat!");
// });

// app.post("/cat", (req: Request, res: Response) => {
//   res.send("POST, It's a cute cat!");
// });

// app.put("/cat", (req: Request, res: Response) => {
//   res.send("PUT, It's a cute cat!");
// });

// app.delete("/cat", (req: Request, res: Response) => {
//   res.send("DELETE, It's a cute cat!");
// });

// app.get("/cat/:id", (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { size } = req.query;
//   res.send(`GET, It's a cute cat! ID: ${id}, Size: ${size}`);
// });
app.use("/cat", catRouter);

app.use("/auth", authMiddleWare, catRouter);
app.use("/static", express.static(path.join(__dirname, "..", "public"))); //public 폴더의 자원들을 가져오는 것.
app.use("/csr", csrRouter);
app.use("/ssr", ssrRouter);
app.use("/short-url", shortUrlRouter);
app.use("/live-clock", liveClockRouter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "Back-end Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
