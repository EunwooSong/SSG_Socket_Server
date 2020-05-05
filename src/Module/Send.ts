
function Send(res, status:Number, mes?:string, result?: boolean ,nickname?:string, userdata?:any, ip?:string) {
  res.status(status).send({result,mes,nickname,userdata,ip}).end();
}
export default Send;