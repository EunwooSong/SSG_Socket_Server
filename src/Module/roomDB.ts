import * as lowdb from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";
import * as fs from "fs";
import { reverse } from "dns";
import { create } from "domain";
import { debug } from "console";

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
  if(!Room) {
    return "This room is already disposed";
  }
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
  return "Successfully left the room.";
}

function start(data) {
  const Room = Roomdb.get("RoomData")
    .find({ _id: data._id })
    .value();
    
    Room.player.forEach(element => {
      element.score = 0;
    });

    Roomdb.get("RoomData")
      .find({_id:data._id})
      .assign({progress : true, player : Room.player, currentTime : 0})
      .write();

    //console.log(Roomdb.get("RoomData").find({_id:data._id}).value());
}

function gameover(data) {
  Roomdb.get("RoomData")
    .find({ _id: data._id })
    .assign({ progress: false })
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
  var playerscore = [];

  RoomP.forEach(data => {
    playerscore.push({ score: data.score, nickname: data.nickname });
  });
  playerscore = sortByKey(playerscore, "score");;

  var result = false;
  playerscore.forEach()

  return {result : result, score : playerscore};
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
  score = sortByKey(score, "score");
  return {result : false, score : score};
}

function join(data) {
  const Room = Roomdb.get("RoomData")
    .find({ _id: data._id })
    .value();
  if (!Room) {
    return "This room does not exist.";
  }
  if (Room.password != data.password) {
    return "Wrong password";
  }
  if (Room.connectedUsers + 1 > 4) {
    return "Room is already full";
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

  return "Successfully entered the room.";
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

function roomset(data) {
  Roomdb.get("RoomData")
    .find({_id: data._id})
    .assign({maximumTime : data.maximumTime, maximumScore : data.maximumScore})
    .write();
}

function updatetimer(data) {
  const Room = Roomdb.get("RoomData").find({_id : data}).value();

  if(Room) {
    const updateTime = Room.currentTime + 1;

    Roomdb.get("RoomData")
      .find({_id : data})
      .assign({currentTime : updateTime})
      .write();
  
    const result = updateTime >= Room.maximumTime;
    return {result : result, currentTime : updateTime, maximumTime : Room.maximumTime}
  }

  else {
    return {result : true, currentTime : 0, maximumTime : 0}
  }
}

function sortByKey(array, key){
  array.sort(function(a, b){
      return a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0;
  })

  return array;
}

export default {
  setting,
  push,
  join,
  searchAll,
  leave,
  start,
  gameover,
  score,
  getScore,
  password,
  roomset,
  updatetimer
};