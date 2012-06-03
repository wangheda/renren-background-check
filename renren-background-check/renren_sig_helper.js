/**
 * 从Array计算sig
 * @param {Array} a 待计算sig的参数数组，形如：["a=a", "d=d", "b=b", "c=c"]
 * @param {String} secret_key 注册后获取的Secret Key
 * @return {String} sig 
 */
function generateSigFromArray(a, secret_key){
	//数组a按字典序排序
    a.sort(function(a, b){
		//取得各参数名
        a_k = (a.split("="))[0];
        b_k = (b.split("="))[0];
        return (a_k < b_k) ? -1 : 1;
    })
	//按序连接所有key=value与secret_key
    var str = a.join('') + secret_key;
    //计算md5
	return hex_md5(str);
}

/**
 * 从Query String计算sig
 * @param {String} qs 待计算sig的参数字符串，形如："a=a&c=c&b=b&d=d"
 * @param {String} secret_key 注册后获取的Secret Key
 * @return {String} sig 
 */
function generateSigFromQueryString(qs, secret_key){
    //拆分Query Stirng
	a = qs.split('&');
    return generateSigFromArray(a, secret_key);
}

/**
 * 从Object计算sig
 * @param {Array} obj 待计算sig的参数对象，形如：{a:"a", d:"d", b:"b", c:"c"}
 * @param {String} secret_key 注册后获取的Secret Key
 * @return {String} sig 
 */
function generateSigFromObject(obj, secret_key){
    var array = [];
    for (key in obj) {
        if (obj.hasOwnProperty(key)) 
            array.push(key + "=" + obj[key])
    }
    return generateSigFromArray(array, secret_key);
}