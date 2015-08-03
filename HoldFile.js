var fs = require('fs'),
	stat = fs.stat;

var p1 = process.argv[2];
var p2 = process.argv[3];

if(p1 == null){
	p1 = './tmp';
	console.log('操作文件路径未送，使用测试路径 [' + p1 + ']');
}
if(p2 == null){
	// p2 = p1 + '/new'

	p2 = p1.substring(0,p1.lastIndexOf('/')) + '/new' + p1.substring(p1.lastIndexOf('/')+1);
	console.log('目标文件夹路径不存在，使用默认目标路径 [ '+ p2 + ']');
}

function cpcpDir(path,newPath,callback) {

	function copy(path,newPath){

		fs.readdir(path, function(err, paths){
			if(paths && paths.length >0){
				paths.forEach(function(p){

					var _path = path + '/' + p;
					var _newPath = newPath + '/' + p;

					stat(_path, function(err,file){
						if(file){
							if(file.isFile()){
								var newName = trimName(p);
								_newPath = newPath + '/' + newName;
								readable = fs.createReadStream(_path);
								writeble = fs.createWriteStream(_newPath);
								readable.pipe(writeble);
							}else if(file.isDirectory){
								cpcpDir(_path, _newPath, copy);
							}
						}else{
							console.log('[' + _path + ' ] 文件 or 文件夹 不存在');
							return;
						}
						
					});
				});
			}
		});
	}

	function trimName(name){
		var n = name.lastIndexOf('.');
		var version;
		var newName;
		if(n >= 0){
			
			version = name.substring(n-5,n).split('.');

			if(version[2] < 9){
				version[2]++;
			}else if(version[2] == 9){
				version[2] = 0;
				if(version[1]==9){
					version[1] = 0;
					version[0]++;
				}else{
					version[1]++;
				}
			}
		
		newName = name.substring(0,n-5);
		version.forEach(function(n){ newName +=n+'.';});
		newName += name.substring(n+1);
		}

		return newName;
	}

	fs.exists(newPath, function(exists){

		if(exists){
			//console.log('文件夹已存在 -- '+newPath);
			copy(path, newPath);
		}else{
			console.log(' ]目标文件夹不存在，执行创建文件夹操作' + '[ ' + newPath + ' ]');
			fs.mkdir(newPath, function(){
				copy(path, newPath);
			});
		}

	});

}


cpcpDir(p1,p2);
