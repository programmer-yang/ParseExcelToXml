var fs = require("fs"),
    stat = fs.stat,
    path = require("path");
var parsexml = require("./parsexml.js");



/**
*  读取公共头
*/
(function readPublicHead(){
  log("开始读取公共头");
  fs.readFile("./template/public_head_in_parser.xml", "UTF-8", function(err,data){
    if(err){
      log("error");
      log("阅读公共头失败");
      return;
    }

    var lines = data.split("\r\n");

    var heads = [];
    var heads_i = 0;
    var heads_str = "";
    // console.log(lines);
    for(var i = 0; i < lines.length; i++){
      if(lines[i].indexOf("<!---")>0){

        var reg = /^ +<!---/;
        if(reg.test(lines[i])){
          //整行插入型数据



        }else{
          //** 中间插入型标识
        }
        // console.log("***");
        heads[heads_i] = heads_str;
        heads_i++;
        heads_str = "";
      }else{
        heads_str += lines[i] + "\r\n";
        // log(heads_str)
        // console.log(lines[i]);
      }
    }
    if(heads_str != null && heads_str.length>0){
      heads[heads_i] = heads_str;
    }


    log(heads);


  });
})();


function writeFileFactory(tasks){
  if(!tasks){
    log("error");
    log("tasks is null");
    return;
  }
  var fileCoding = "UTF-8";

  for(var n in tasks){
    var filePath = tasks[n].filePath;
    var fileName = tasks[n].fileName;
    var fileData = parsexml.parseXmlStr(tasks[n].fileData);

    // console.log(filePath+":"+fileName+":"+fileData);
    var task = {};
    task.filePath = tasks[n].filePath;
    task.fileName = tasks[n].fileName;
    task.fileData = parsexml.parseXmlStr(tasks[n].fileData);
    task.fileCoding = fileCoding;

    // console.log("开始打印");
    // console.log(fileData);
    // continue;
    dirTrim(filePath, task, function(task){
      writeFile(task);
    });

  }

}

function writeFile(task){

  log("开始写入【"+ task.filePath+task.fileName +"】");
  fs.writeFile(task.filePath+task.fileName, task.fileData, task.fileCoding, function(err){
    if(err){
      log("error");
      log("写入文件【"+task.filePath+task.fileName+"】失败，请检查文件数据和路径是否正确");
      return;
    }
    log("写入文件【"+task.filePath+task.fileName+"】成功");
  });
}

/**
*  递归创建多级文件目录
*  目前存在有多次调用问题，需优化
*/
function dirTrim(dirpath, task, callback){
  fs.exists(dirpath, function(exists) {
    if(exists) {
      callback(task);
    } else {
      // log("目标目录不存在，创建【"+dirpath+"】成功");
      dirTrim(path.dirname(dirpath), task, function(){
        fs.mkdir(dirpath, function(){
          // log("创建目录【"+dirpath+"】成功");
          callback(task);
        });

      });
    }
  });
}


function log(str){
  console.log(new Date().toLocaleTimeString()+" # " + str + " ");
}



exports.write = writeFileFactory;
