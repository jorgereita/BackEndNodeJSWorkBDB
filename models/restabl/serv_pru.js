
var request = require("request");

/**
 * metodo para consultar el servicio de progress
 * @param {*} method metodo de peticion html 
 * @param {*} url url del servicio al que se va a conectar
 * @param {*} qs parametros que van en la url como el idWeb
 * @param {*} body parametros que van en el json de entrada que va para el servicio
 */
module.exports.servAbl = function (method,url,qs,body) {
	var options = { method: method,
	url:url,
	qs:qs,
	body:body,
	json: true };
	return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) {
				throw new Error(error);
				resolve(error);
			}
            resolve(body);
        })
	});
}
