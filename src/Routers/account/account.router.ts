import * as express from "express"
import { Signin,Signup,PlayerType } from "./account.controller";

const router = express.Router();

router.post("/signin", Signin);
router.post("/signup",Signup);
router.post("/playerType", PlayerType);

export default router