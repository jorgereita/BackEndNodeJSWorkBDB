
var request = require("request");
var fs = require('fs');
var msg_error = JSON.parse(fs.readFileSync('msg_error.json')).id_msg;
/**
 * metodo para consultar el servicio de progress
 * @param {*} method metodo de peticion html 
 * @param {*} url url del servicio al que se va a conectar
 * @param {*} qs parametros que van en la url como el idWeb
 * @param {*} body parametros que van en el json de entrada que va para el servicio
 */
module.exports.SIRsic_param = function (method, url, qs, body) {
    var secret = require('../../secret');
    var jwt = require('jsonwebtoken');
    var options = {
        method: method,
        url: url,
        // url:'https://desarrollo.portalintegrity.cloud:8821/rest/Parameters/SIRsic_param',
        qs: qs,
        body: body,
        strictSSL: false,
        json: true
    };
    
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(qs.idWeb, secret.passToken, function (err, decoded) {
                if (err) {
                    console.log("No tiene permisos web");
                    reject(err);
                    // throw err;
                } else {
                    console.log(decoded)
                    console.log("------------------------------------");
                        console.log(JSON.stringify(options));
                        console.log("---------------------------------------");
                    request(options, function (error, response, body) {
                        console.log(JSON.stringify(body));
                        console.log(JSON.stringify(response));
                        console.log(JSON.stringify(error));
                        
                        if((body===undefined)||(body.dsSIRsic_param===undefined)||(body.dsSIRsic_param.eeEstados===undefined)){
                            console.log("Servicio SIRsic_param tiene fallos.")
                            error=true;
                            
                        }
                        if (error) {
                            resolve(msg_error[4].Returnid)
                        } else if(body.dsSIRsic_param.eeEstados[0].Returnid===0) {
                            // body.dsSIRsic_param.eesic_param[0].param__val = 'mongodb://localhost:27017/'
                            resolve(body.dsSIRsic_param);
                        } 
                        else{
                            reject(body)
                            // resolve(msg_error[5].Returnid)
                        }
                    })
                }
              });
        } catch (e) { 
            console.log(e  +"Console en SIRsic_param");
            reject(e +"Resolve en SIRsic_param") }
    });
}
