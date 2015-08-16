var systems = require("./systems.js"),
    parsexml = require("./parsexml.js"),
    writefile = require("./writefile.js");
var fs = require("fs");

/**
*  任务工厂
*  返回一些列任务，每个任务中包含该任务所需数据
*/

/**
*  任务开始前的准备工作
*/
function init(ep,fuc) {
  log("初始化任务开始");
  ep.all("publicHead",function(publicHead){
    log("获取公共头成功");
    fuc(publicHead);
  });

  log("初始化公共头");
  readPublicHead(ep);
  //...

}

/**
*  读取公共头
*/
function readPublicHead(ep){
  log("开始读取公共头");
  var dirpath = "./template/";
  var publicHead = {};
  fs.readdir(dirpath,function(err,files){
    if(err){
      console.log("error:"+err);
    }
    // log(publicHead[0]);
    ep.after('readHead',files.length,function(heads){
      // console.log("haha");
      ep.emit('publicHead',publicHead);
    });

    for (var i = 0; i < files.length; i++) {
      var fileName = files[i];
      //
      var name = fileName.substring(0,fileName.indexOf('_'));
      var type = fileName.substring(fileName.indexOf('_')+1,fileName.indexOf('.xml'));
      publicHead[name] = {};
      publicHead[name][type] = {};

      (function(name,type){
        fs.readFile(dirpath+fileName,'UTF-8',function(err,data){
          //
          publicHead[name][type] = trimLines(data);
          // log(name+type+"***");
          ep.emit('readHead',null);

        });
      })(name,type);


    }

  });

}

function trimLines(data){
  var lines = data.split("\r\n");

  var heads = [];
  var heads_i = 0;
  var heads_str = "";
  // log(lines);
  for(var i = 0; i < lines.length; i++){
    if(lines[i].indexOf("<!---")>0){

      heads[heads_i] = {type:"data",data:heads_str};
      heads_i++;
      heads_str = "";

      var reg = /^ +<!---/;
      if(reg.test(lines[i])){
        //整行插入型数据
        var name = lines[i];
        name = name.substring(name.indexOf('<!---')+6,name.indexOf('-->')-1);
        heads[heads_i] = {type:"line",data:name,blank:(lines[i].indexOf('<!---'))/2};
        heads_i++;
      }else{
        //** 中间插入型标识
        //placeholder
      }
      // log("***");

    }else{
      heads_str += lines[i] + "\r\n";
      // log(heads_str)
      // log(lines[i]);
    }
    if(i == lines.length-1){

      heads[heads_i] = {type:"data",data:heads_str};
    }
  }
  // log(heads[0].data+heads[1].data+heads[2].data);
  return heads;
}


/**
*  任务数据获取方法
*/
function getTask(sheets,publicHead){
  log("任务开始");
  if(sheets==null || sheets.length<=0){
    log("页签集为空，请检查选中的excel是否正确");
    return;
  }

  log("开始循环页签集合");
  var taskList = {};
  var taskData = {};
  for(var n in sheets){
    // log("循环一次");
    var sheet = sheets[n];
    var datas = "";
    if(sheet.name === "索引"){
      log("开始处理页签【索引】");
      datas = sheet.data;
      //获取服务码+服务名称
      for(var i = 2;i<datas.length;i++){
        var line = datas[i];
        var serviceCode = line[2];
        var serviceSance = line[4];
        var sheetPath = line[8];
        var consumer = line[6];
        var provider = line[7];
        var newTask = {};

        newTask.path = sheetPath;
        newTask.consumer = systems.getSysCode(consumer);
        newTask.provider = systems.getSysCode(provider);

        //参数判断，目前只判断服务消费者和服务提供者
        //如果需要判断别的，在次添加即可
        if(newTask.consumer == null||newTask.provider == null){
          log("error");
          log("获取【"+serviceCode+''+serviceSance+"】服务的消费或提供CODE错误，"+
          "请检查systems.js模块");
        }

        taskList[serviceCode+''+serviceSance] = newTask;
      }
      // break;
    }else{
      // continue;
      taskData[sheet.name] = sheet.data;
    }
  }
  log("获取任务集合成功");
  log("===========");
  log(taskList);
  log("===========");

  trimTask(taskList, taskData, publicHead);
}

/**
*  任务处理方法
**/
function trimTask(taskList, taskData, publicHead){
  log("进入任务处理方法，开始遍历任务集合");

  if(!taskList || !taskData){
    log("error");
    log("任务集合或者任务数据为空，请检查原始数据或getTask方法是否正常");
    return;
  }
  var task = {};
  // task.filenames = new Array("in_parser","in_packer","in_server",
  //                           "out_parser","out_packer","out_server");
  for(var n in taskList){

    task.name = n;
    task.path = taskList[n].path;
    task.consumer = taskList[n].consumer;
    task.provider = taskList[n].provider;

    log("开始处理任务："+task.name);
    //遍历索引页签中的任务列表，获取每个任务对应的数据
    //计划返回到一个集合中，然后统一到另外一个方法中输出

    var sheetData = taskData[task.path];
    if(!sheetData){
      log("error");
      log("获取页签【"+path+"】原始数据失败,请检查TaskData数据是否正确");
      return;
    }
    log("获取任务【"+task.name+"】页签【"+task.path+"】 原始数据成功");

    var tasktype = task.consumer+'2'+task.provider;

    var xmldata = getNatpToXmlData(task, sheetData);

    task.type = tasktype;
    task.data = xmldata;
    // task.publicHead = publicHead

    // log("Test");
    // log(task);
    task.publicHead = publicHead[task.type];
    // // log(task);
    // return;
    writefile.write(task);

    //测试使用，执行一次
    break;
  }
}

function getNatpToXmlData(task,taskData){
  //获取配置数据
  log("开始处理【"+task.name+"】原始数据");


  var in_parser_data = new Array();
  // in_parser_data = in_parser_data.concat(in_public_head_parser);

  var in_packer_data = new Array();
  // in_packer_data = in_packer_data.concat(in_public_head_packer);

  var out_parser_data = new Array();
  var out_packer_data = new Array();
  var in_parser_data = new Array();
  var xmldata,status = "head";
  for(var i=4; i<taskData.length; i++){
    var line = taskData[i];
    var _A = line[0];
    var inxmlnode = {};
    var outxmlnode = {};

    if(_A === "输入"){
      // console.log("输入");
      status = "in";
      continue;
    }else if(_A === "输出"){
      // console.log("输出");
      status = "out";
      continue;
    }
    var _B = line[1];
    var _H = line[7];
    var _I = line[8];
    var _J = line[9];

    // console.log(_A+":"+_B+":"+_H+":"+_I+":"+_J);
    if(status === "in"){
      inxmlnode.name = _A;
      inxmlnode.args = new Array({name:"metadataid",value:_H}, {name:"chinese_name",value:_B});
      in_parser_data.push(inxmlnode);

      outxmlnode.name = _H;
      outxmlnode.args = new Array({name:"metadataid",value:_H}, {name:"chinese_name",value:_I});
      out_parser_data.push(outxmlnode);
    }else if(status === "out"){
      inxmlnode.name = _A;
      inxmlnode.args = new Array({name:"metadataid",value:_H}, {name:"chinese_name",value:_B});
      in_packer_data.push(inxmlnode);

      outxmlnode.name = _H;
      outxmlnode.args = new Array({name:"metadataid",value:_H}, {name:"chinese_name",value:_I});
      out_packer_data.push(outxmlnode);
    }else{
      continue;
    }
  }

  var xmltasks = new Array();

  //in
  var in_parser = {};
  in_parser.type = "in_parser";
  in_parser.filePath = "./tmp/"+task.name+"/in/";
  in_parser.fileName = "channel_"+task.consumer+"_service_"+task.name+".xml";
  // in_parser.publicData = {};
  // in_parser.publicData.type = "in_parser";
  in_parser.fileData = {};
  in_parser.fileData.name = "message";
  in_parser.fileData.args = new Array({name:"package_type",value:"natp"},{name:"store-mode",value:"GBK"});
  in_parser.fileData.children = in_parser_data;

  var in_packer = {};
  in_packer.filePath = "./tmp/"+task.name+"/in/";
  in_packer.fileName = "service_"+task.name+"_system_"+task.consumer+".xml";
  in_packer.fileData = {};
  in_packer.fileData.name = "message";
  in_packer.fileData.args = new Array({name:"package_type",value:"natp"},{name:"store-mode",value:"GBK"});
  in_packer.fileData.children = in_packer_data;

  var in_server ={};
  in_server.filePath = "./tmp/"+task.name+"/in/";
  in_server.fileName = "service_"+task.name+".xml";
  in_server.fileData = {};
  in_server.fileData.name = "S"+task.name;
  in_server.fileData.children = in_packer_data;

  //out
  var out_parser = {};
  out_parser.filePath = "./tmp/"+task.name+"/out/";
  out_parser.fileName = "channel_"+task.provider+"_service_"+task.name+".xml";
  out_parser.fileData = {};
  out_parser.fileData.name = "message";
  out_parser.fileData.args = new Array({name:"package_type",value:"natp"},{name:"store-mode",value:"GBK"});
  out_parser.fileData.children = out_packer_data;

  var out_packer = {};
  out_packer.filePath = "./tmp/"+task.name+"/out/";
  out_packer.fileName = "service_"+task.name+"_system_"+task.provider+".xml";
  out_packer.fileData = {};
  out_packer.fileData.name = "message";
  out_packer.fileData.args = new Array({name:"package_type",value:"natp"},{name:"store-mode",value:"GBK"});
  out_packer.fileData.children = out_parser_data;


  var in_server_request = {};
  var in_server_request_sdoroot = {};
  var in_server_request_sdoroot_body = {};
  in_server_request.name = "request";
  in_server_request_sdoroot.name = "sdoroot";
  in_server_request_sdoroot_body.name = "BODY";
  in_server_request_sdoroot_body.children = out_parser_data;
  in_server_request_sdoroot.children = new Array(in_server_request_sdoroot_body);
  in_server_request.children = new Array(in_server_request_sdoroot);
  in_server.fileData.children = new Array(in_server_request);

  var in_server_response = {};
  var in_server_response_sdoroot = {};
  var in_server_response_sdoroot_body = {};
  in_server_response.name = "response";
  in_server_response_sdoroot.name = "sdoroot";
  in_server_response_sdoroot_body.name = "BODY";
  in_server_response_sdoroot_body.children = out_packer_data;
  in_server_response_sdoroot.children = new Array(in_server_response_sdoroot_body);
  in_server_response.children = new Array(in_server_response_sdoroot);


  in_server.fileData.children = new Array(in_server_request, in_server_response);




  // xmltasks.push(in_parser, in_packer, in_server, out_parser,out_packer);
  xmltasks.push(in_parser);

  return xmltasks;


  // for(var n in task.filenames){
  //   if(fileNames[n].type === "in_parser"){
  //     var task = {};
  //     task.fileName = "channel_"+task.consumer+"_service_"+task.name+".xml";
  //
  //     //参考
  //     var in_parser = {};
  //     in_parser.filename = "channel_"+task.consumer+"_service_"+task.name+".xml";
  //     in_parser.data = {};
  //     in_parser.data.name = "message";
  //
  //     in_parser.data.args = new Array({name:"package_type",value:"natp"},{name:"store-mode",value:"GBK"});
  //     var children = new Array();
  //   }
  //
  // }


}







function log(str){
  console.log(new Date().toLocaleTimeString()+" # " + str + " ");
}

exports.init = init;
exports.getTask = getTask;
