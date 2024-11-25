const express = require("express");//引入我们的express模板引擎
const app = express();//创建实例
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("node:path");
var STUDENTS_ARR = require("./data/user.json");
const bodyParser = require("body-parser")
const cors = require("cors");//适配后端请求头
const { json } = require("body-parser");
app.use(express.urlencoded({ entended: true }));//解析post请求
app.use(express.json())//解析json请求的数据
app.use(cors());
app.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*");//配置跨域请求地址
    response.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST,GET,PUT,PATCH,DELETE");//配置跨域请求方式
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,authorization");//配置跨域请求头类型
    next();

})

app.post("/login", (requset, response) => {//设置登录的路由
    //这个地方最好也需要异常处理
    console.log("有人访问我了")
    
    const users = STUDENTS_ARR;//拿到所有的用户，并将其进行转换
    console.log(requset.body)
    const isauth = users.filter((e) => {//要么登录成功，要么登录失败
        if (requset.body.userid === e.userid && requset.body.password === e.password) {
            return true;
        }
        else {
            return false;
        }
    })
    console.log(isauth)
    if (isauth) {

        const userid = requset.body.userid;
        const jwt = jsonwebtoken.sign({ userid }, "dazhaxie", { expiresIn: "3000000" })//此时表明，用户登录成功，我们发送token
        response.status(200).send({    //设置时间为3600秒
            useridentity: jwt,
            username: isauth[0].name,
            state: "OK"
        })
    }
    else {
        response.status(403).send({
            state: "error"
        })
    }
})
//获取学生主要信息内容
app.get("/getstuinfo", (request, response) => {
    console.log(request.get("Authorization"));
    STUDENTS_ARR = JSON.parse(fs.readFileSync("./data/user.json"));
     console.log(JSON.parse(fs.readFileSync("./data/user.json")));
    
    const token = request.get("Authorization").split(" ").splice(1, 1);

    const s = jsonwebtoken.verify(token[0], "dazhaxie");
    if (s.userid) {
        //在这里加一个判断，至此，所有的内容已经完毕，接下来就是前端法功的时候
        response.status(200).send({
            state: "OK",
            data: STUDENTS_ARR
        })
    }
    else {
        Response.status(400).send(
            {
                state: "error"
            }
        )
    }
})






//进行添加学生信息    
app.put("/addstudentinformation", (request, response) => {
    const token = request.get("Authorization").split(" ").splice(1, 1);
    const s = jsonwebtoken.verify(token[0], "dazhaxie");
    let userids = 1;
    if (STUDENTS_ARR.at(-1) != undefined) {
        userids = +STUDENTS_ARR.at(-1).userid + 1;
    }
    else {
        userids = 1;
    }
    if (s.userid) {
        STUDENTS_ARR.push({
            "userid": `${userids}`, "password": `${request.body.data.password}`, "name": `${request.body.data.name}`,
            "age": `${request.body.data.age}`, "gender": `${request.body.data.gender}`,
            "phone": `${request.body.data.phones}`
        });
        
        const studentinformation = JSON.stringify(STUDENTS_ARR);
        
        fs.writeFile(
            path.resolve(__dirname, "./data/user.json"),
            studentinformation,
            err => {
                if (err) {
                  console.error(err);
                }}
        );
            
                console.log(studentinformation)
                response.status(200).send({
                    states: "OK",
                });
          
                // response.status(500).send({
                //     states: "error",
                // });




    }
    else {
        response.status(200).send({
            states: "error"
        });
    }
})


app.use((request,response,next)=>{
    const token = request.get("Authorization").split(" ").splice(1, 1);
    const s = jsonwebtoken.verify(token[0], "dazhaxie");
    if(s.userid)
    {
        next();
    }
    else{
        response.send({
            status:"error"
        })
    }
})



app.delete("/deletestu",(requset,response)=>{
    const userid= requset.body.userid;
   
    const result= STUDENTS_ARR.filter((e)=>e.userid!=userid.toString());
  console.log(JSON.stringify(result));
   const delestudentinfomation= JSON.stringify(result);
    fs.writeFile(
        path.resolve(__dirname, "./data/user.json"),
       delestudentinfomation,
        err => {
            if (err) {
              console.log(err);
            }}
    );

    
     console.log(STUDENTS_ARR);
    response.send("OK")
})






//当用户输入的地址不存在的时候，当然，前后端分离的项目一般来说不会出现这种情况
app.use("/", (request, resonse) => {
    resonse.status(403).send({
        data: {
            error: "你输入的地址被外星人劫持"
        }
    })
})


app.listen(7000, () => { console.log("服务器已经准备就绪，接下来准备监听") });//开始监听