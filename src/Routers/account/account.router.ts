import * as express from "express"
import { Signin,Signup,Custom } from "./account.controller";

const router = express.Router();

router.post("/signin", Signin);
router.post("/signup",Signup);
router.post("/custom", Custom);

export default router