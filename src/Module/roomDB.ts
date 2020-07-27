import * as lowdb from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";
import * as fs from "fs";

fs.unlink("Room.json", function(err) {
  if (err) throw err;
});
const adapter = new FileSync("Room.json");
const Roomdb = lowdb(adapter);
function searchAll() {
  return Roomdb.get("RoomData").value();
}

function setting() {
  Roomdb.defaults({ RoomData: [] }).write();
}

function push(data) {
  Roomdb.get("RoomData")
    .push(data)
    .write();
}

function leave(data) {
  const Room = Roomdb.get("RoomData")
    .find({ _id: data._id })
    .value();
  const player = Room.player;
  if (player.length != 1 && data.master == true) {
    player[1].master = true;
  }
  else if (player.length == 1) {
    console.log("Auto Room Dispose . . ." + data._id);
    Roomdb.get("RoomData").remove({ _id : data._id}).write();
  }
  const UpdatePlayer = player.filter(value => value.nickname != data.nickname);
  const people = Room.connectedUsers - 1;
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ connectedUsers: people })
    .write();
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ player: UpdatePlayer })
    .write();
  return "방을 성공적으로 나갔습니다";
}

function start(data) {
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ progress: true })
    .write();
}

function score(data) {
  const Room = Roomdb.get("RoomData")
    .find({ _id: data._id})
    .value();
  const RoomP = [];
  Room.player.forEach(element => {
    if (element.nickname == data.whoKill) {
      element.score += 1;
    }
    RoomP.push(element);
  });

  Room.player = RoomP;
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ player: Room.player })
    .write();
  const playerscore = [];

  RoomP.forEach(data => {
    playerscore.push({ score: data.score, nickname: data.nickname });
  });
  return playerscore.reverse();
}

function getScore(data) {
  const room = Roomdb.get("RoomData")
    .find({_id : data._id})
    .value();
  const roomPlayer = [];
  room.player.forEach(_p => {
    roomPlayer.push(_p);
  });
  
  var score = [];
  roomPlayer.forEach(_d => {
    score.push({score : _d.score, nickname : _d.nickname});
  });

  return score.reverse();
}

function join(data) {
  const Room = Roomdb.get("RoomData")
    .find({ _id: data._id })
    .value();
  if (!Room) {
    return "해당 방이 없습니다";
  }
  if (Room.password != data.password) {
    return "비밀번호가 틀립니다";
  }
  const player = Room.player;
  player.push({
    nickname: data.nickname,
    master: false,
    score: 0,
    ip:data.ip
  });
  const people = Room.connectedUsers + 1;
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ connectedUsers: people })
    .write();
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ player: player })
    .write();
  return "성공적으로 방에 입장하셨습니다";
}

function password(data) {
  const password = Roomdb.get("RoomData")
    .find({ _id: data })
    .value().password;

  const Room = Roomdb.get("RoomData")
    .find({ _id: data })
    .value();
  const RRoom = [];
  Room.player.forEach(value => {
    value.score = 0;
    RRoom.push(value);
  });
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ player: RRoom })
    .write();
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ progress: false })
    .write();
  //스코어 초기화해야됨
  //진행중을 바꿔야됨
  return password;
}
export default {
  setting,
  push,
  join,
  searchAll,
  leave,
  start,
  score,
  getScore,
  password
};