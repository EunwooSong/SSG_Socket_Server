import * as shortid from "shortid";
import { Request, Response } from "express";
import Send from "../../Module/Send";
import roomDB from "../../Module/roomDB";
import socket from "../../Module/socket";

export const Create = (req: Request, res: Response) => {
  const { roomname, nickname, userdata, password, personnel, ip } = req.body;
  const random: string = shortid.generate();

  //이 사이에는 방 인원수 제한등등을 구현
  roomDB.push({
    _id: random,
    roomname,
    personnel,
    connectedUsers: 1,
    maximumUsers : 4,
    currentTime : 0,
    maximumTime : 120,
    maximumScore : 6,
    passwordLock: password ? true : false,
    password,
    progress: false,
    player: [
      {
        nickname,
        master: true,
        score: 0,
        upgrade : 0,
        count : 0,
        ip : ip
      }
    ]
  });
  Send(res, 200, random, true);
};

export const Join = (req: Request, res: Response) => {
  const { _id, password, nickname, userdata, ip } = req.body;
  const join = roomDB.join({
    _id,
    password,
    nickname,
    userdata,
    ip
  });
  Send(res, 200, join, join == "Successfully entered the room." ? true : false);
};

export const Leave = (req: Request, res: Response) => {
  const { _id, nickname, master } = req.body;
  const leaveMes = roomDB.leave({ _id, nickname, master });
  
  Send(res, 200, leaveMes, leaveMes == "Successfully left the room." ? true : false);
};

export const Start = (req: Request, res: Response) => {
  const { _id } = req.body;
  roomDB.start({ _id });
  Send(res, 200, "Successfully started the game", true);
};

export const Roomset = (req : Request, res : Response) => {
  const {_id, maximumTime, maximumScore} = req.body;
  if (!(_id || maximumTime || maximumScore)) {
    Send(res, 200, "Client Data is missing.", false);
  }
  else if(maximumTime < 10 || maximumScore < 1) {
    Send(res, 200, "Please set it to a higher value.", false)
  }
  else {
    roomDB.roomset({_id, maximumTime, maximumScore});
    Send(res, 200, "Successfully Changed the room setting", true);
  }
};

export const All = (req: Request, res: Response) => {
  const list = roomDB.searchAll();
  res.status(200).send(list);
};
