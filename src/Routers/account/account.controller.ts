import * as bcrypt from "bcrypt-nodejs";
import { Request, Response } from "express";
import User from "../../Model/account";
import Send from "../../Module/Send";
import { threadId } from "worker_threads";

export const Signup = (req: Request, res: Response) => {
  const { id, password, nickname } = req.body;
  User.findOne({ id: id }, function(err, result) {
    if (err) throw err;
    if (!(id || password || nickname)) {
      Send(res, 200, "Please fill in all input fields.", false);
    }
    if (result == null) {
     User.findOne({nickname:nickname},function(err,result){
     
     if(result == null){
     
      //생성
      bcrypt.hash(password, null, null, function(err, hash) {
        const user: any = new User({
          id: id,
          password: hash,
          nickname: nickname,
          userdata: { type: 0 }
        });

        user
          .save()
          .then(data => {
            Send(res, 200, "Sign up successed.", true);
          })
          .catch(err => Send(res, 200, "DB save failed.", false));
	  });
	 }else{
		Send(res,200,"Duplicate nickname.",false);
	 }
	})
    } else {
      Send(res, 200, "Duplicate ID", false);
    }
  });
};
export const Signin = (req: Request, res: Response) => {
  const { id, password } = req.body;
  if (!(id || password)) {
    Send(res, 200, "Please fill in all input fields.", false);
  }
  User.findOne({ id: id }, function(err, result) {
    if (err) throw err;
    if (result != null) {
      // 만약 계정이 있을 때
      bcrypt.compare(password, result.password, function(err, value) {
        if (value == true) {
          //비밀번호O
          Send(
            res,
            200,
            "Sign In Successed.",
            true,
            result.nickname,
            result.userdata,
            req.connection.remoteAddress
          );
        } else {
          Send(res, 200, "Password mismatch.", false);
        }
      });
    } else {
      Send(res, 200, "ID missing.", false);
    }
  });
};

export const Custom = (req: Request, res : Response) => {
  const {id, type} = req.body;
  if (!(id || type)) {
    Send(res, 200, "Client Data is missing.", false);
  }

  //User.findOneAndUpdate({id:id}, {$set : {userdata : {type : type}}})
  User.update({id : id}, {$set : {userdata : {type : type}}})
  .then(data => {
    Send(res, 200, "User Type Change Successed.", true);
  });
} 