/**
 * modulo rest Api para el servicio bpm_task
 * @param {*} router 
 * @param {*} io instancia socket clientye a la que se va a conectar
 * @param {*} fs 
 * @param {*} msg_error json de errores
 * @param {*} SIRsic_param servicio abl para obtener la url de bd mongo a la que se va a conectar 
 */
// var mongoose = require('mongoose');
// Load the AWS SDK for Node.js
var request = require("request");
// mongoose.Promise = global.Promise;
module.exports = function (router, io, fs, msg_error, SIRsic_param,jwt,secret) {

    ////////////////////////parametros para todos los servicios/////////////////////////////////////////
    function parametros(req, res) {
      var body = {
        "dsSIRsic_param": {
          "eeDatos": req.body.dsJWT.eeDatos,
          "eeSIRsic_param": [{
            "picparam__id": "urlMongo"
          }]
        }
      };

        var myurl;
        if(req.body.dsJWT.eeConfig[0].serv_ip.startsWith("http")){
            myurl = req.body.dsJWT.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
        }else{
            myurl = 'http://' + req.body.dsJWT.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
        }
        
      var result = {
        "socketi": req.app.get('io'),
        "arrayserv": req.body.dsJWT.get_jwt,
        // "url":   req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param',
        "url": myurl,
        "qs": { idWeb: req.body.idWeb || req.query.idWeb || req.headers['idWeb'] },
        "body": body
      }
      return result;
    }
    /**
     * servicio para enviar mensajes
     */
    router.route('/get_jwt').post(function (req, res) {
      try {
        var result = parametros(req, res);
        // SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
          try {
            var options = {
                method: "post",
                url: result.url,
                // url:'https://desarrollo.portalintegrity.cloud:8821/rest/Parameters/SIRsic_param',
                qs: result.qs,
                body: result.body,
                strictSSL: false,
                json: true
            };
            request(options, function (error, response, body) {
                console.log(JSON.stringify(body));
                if((body===undefined)||(body.dsSIRsic_param===undefined)||(body.dsSIRsic_param.eeEstados===undefined)){
                    console.log("Servicio SIRsic_param tiene fallos.")
                    error=true;
                    
                }
                if (error) {
                    throw msg_error[4].Returnid
                } else if(body.dsSIRsic_param.eeEstados[0].Returnid===0) {
                    // body.dsSIRsic_param.eesic_param[0].param__val = 'mongodb://localhost:27017/'
                    var texto =  {user: result.body.dsSIRsic_param.eeDatos[0].picusrcod};
                    console.log(texto)
                    jwt.sign(texto, secret.passToken, function(err, token) {
                        console.log("el token solicitado es:   " + token);
                        res.json(token);
                        res.end();
                    });
                } 
                else{
                    console.log(body);
                    res.json(body);
                    res.end();
                    // resolve(msg_error[5].Returnid)
                }
            })
            if (result.arrayserv.length !== 0) {
                
            }
          } catch (e) {
            console.log("paso por acá   " + JSON.stringify(e));
            res.json(e);
            throw e;
          }
        
      } catch (e) {
        console.log(e);
        res.json(e);
        res.end();
      }
    });
  };   