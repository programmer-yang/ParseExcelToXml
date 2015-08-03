var mexcel = require('node-xlsx');
var XMLFactory = require('simple-xml-writer'),
	fs = require('fs');
var TaskFactory = require("./taskFactory.js");






var sheets = mexcel.parse('data/abc.xlsx');

TaskFactory.getTask(sheets);


// for(var sheetIndex in sheet) {
// 	var page = sheet[sheetIndex];
//
// 	if(page.name === '索引') {
// 		console.log(page);
// 		console.log(page.data.length);
// 	}
//
// }

// var sxw = XMLFactory.XmlWriter;

// var data = new sxw(function(el){
// 	el('service',function(el,at){
// 		at('package_type', 'xml');
// 		at('store', 'UTF-8');
// 		el('SYS_HEAD', function(el,at){
// 			el('ReturnStatus',function(el,at){
// 				at('metadataid', 'ReturnStatus');
// 				at('chinese_name', '交易状态');
// 			});
// 		});

// 	});
// },{addDeclaration: true});
//console.log(data.toString());


// console.log(data.toString());


// var data = new sxw(function(el) {
//     el('root', function(el, at) {
//         at('xmlns:c', 'http://schemas.xmlsoap.org/wsdl/');
//         el('node', function(el, at) {
//             at('name', 'foo');
//             at('null_attr');
//             at('empty_attr', '');

//             el('value', 'foo');
//             el('null_node');
//             el('empty_node', '');
//             el('encode', 'тест ß');
//             el('c:value', 'text', function(el) {
//                 el('encoding', 'tags:  <br />', function(el, at, text) {
//                     at('quotes', '""');
//                     el('dd', function(el, at, text) {
//                         text('foo')
//                         text('bar')
//                     })
//                 });
//             });
//         });
//     });
// }, { addDeclaration: true });

// console.log(data.toString());
