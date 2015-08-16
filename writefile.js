var fs = require("fs"),
    stat = fs.stat,
    path = require("path");
var parsexml = require("./parsexml.js");

function writeFileFactory(tasks){
  if(!tasks){
    log("error");
    log("tasks is null");
    return;
  }

  var fileCoding = "UTF-8";


  for(var n in tasks.data){

    // console.log("TEST");
    var newxmldata = "";
    tasks.publicHead[tasks.data[n].type].forEach(function(data){
      if(data.type === "data"){
        newxmldata += data.data + "\n";
      }else if(data.type === "line"){
        // console.log(" *** ");
        // console.log(data);
        // console.log(tasks.data[n]);
        newxmldata += parsexml.parseXmlStr(tasks.data[n].fileData,false,data.blank).data + "\n";
      }
    });
    // console.log(newxmldata);
    //拼公共头
    // return;


    // var filePath = tasks[n].filePath;
    // var fileName = tasks[n].fileName;
    // var fileData = parsexml.parseXmlStr(tasks[n].fileData);

    // console.log(filePath+":"+fileName+":"+fileData);
    var task = {};
    task.filePath = tasks.data[n].filePath;
    task.fileName = tasks.data[n].fileName;
    // task.fileData = parsexml.parseXmlStr(tasks[n].fileData);
    task.fileData = newxmldata;
    task.fileCoding = fileCoding;

    // console.log("开始打印");
    // console.log(fileData);
    // continue;
    dirTrim(task.filePath, task, function(task){
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
