
var XMLFactory = require('simple-xml-writer');

//测试方法
function xmlFactory() {
	var xmlstr = {
		name : 'service',
		args : [{name: 'package_type', value: 'xml'},{name: 'store-mode', value:'UTF-8'}],
		children : [
			{
				name: 'SYS_HEAD',
				children : [
					{
						name: 'ReturnStatus',
						args: [{name: 'metadataid', value: 'ReturnStatus'}, {name: 'chinese_name', value: '交易状态'}]
					},
					{
						name: 'array',
						children: [
							{
								name: 'Ret',
								args:[{name : 'metadataid', value: 'Ret'},{name:'type',value:'array'},{name:'is_struct',value:'false'}],
								children: [
									{
										name: 'ReturnCode',
										args: [{name:'metadataid',value:'ReturnCode'},{name:'chinese_name',value:'交易返回码'}]
									},
									{
										name: 'ReturnMsg',
										args: [{name:'metadataid',value:'ReturnMsg'},{name:'chinese_name',value:'交易返回信息'}]
									}
								]
							}
						]
					},
					{
						name: 'ServSeqNo',
						args: [{name: 'metadataid', value: 'ServSeqNo'}, {name: 'chinese_name', value: '服务系统流水号'}]
					}
				]
			}
		]
	}


	// console.log(xmlstr.args.length);
	// return;

	var data = parseXmlStr(xmlstr);

	console.log(data.toString());

}

//测试
// xmlFactory();


function parseXmlStr(str,declaration,level) {

	str = str || {};
	declaration = declaration || true;
	level = level || 0;
	var options =  {};
	options.declaration = declaration;
	options.level = level;

	var data = new XMLFactory.XmlWriter(function(el){

		var name = str.name;

		// console.log(name);

		el(name,function(el,at){
			if(str.args && str.args.length!= 0) {
				for(var n in str.args) {
					var arg = str.args[n];
					at(arg.name, arg.value);
				}
			}
			if(str.children && str.children.length!=0) {
				for(var n in str.children) {
					var arg = str.children[n];

					//el(arg.name,function(){});
					trimChildren(el, at, arg);

				}
			}

		});
	},{addDeclaration: options.declaration, level: options.level});



	function trimChildren(el, at, child) {


		if (child !=null && child.name != null) {

			el(child.name, function(el,at){

				if(child.args && child.args.length!= 0) {
					for(var n in child.args) {
						var c = child.args[n];
						at(c.name, c.value);
					}
				}
				if(child.children && child.children.length!=0) {
					for(var n in child.children) {

						trimChildren(el, at, child.children[n]);

					}
				}

			});

		}

	}

	return data;

}


exports.parseXmlStr = parseXmlStr;
