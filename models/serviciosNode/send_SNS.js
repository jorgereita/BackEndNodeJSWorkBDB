/**
 * modulo rest Api para el servicio bpm_task
 * @param {*} router 
 * @param {*} io instancia socket clientye a la que se va a conectar
 * @param {*} fs 
 * @param {*} msg_error json de errores
 * @param {*} SIRsic_param servicio abl para obtener la url de bd mongo a la que se va a conectar 
 * @param {*} AWS paquerte de aws_sdk 
 */
// var mongoose = require('mongoose');
// Load the AWS SDK for Node.js

// mongoose.Promise = global.Promise;
module.exports = function (router, io, fs, msg_error, SIRsic_param, AWS) {

  ////////////////////////parametros para todos los servicios/////////////////////////////////////////
  function parametros(req, res) {
    var body = {
      "dsSIRsic_param": {
        "eeDatos": req.body.dsSNS.eeDatos,
        "eeSIRsic_param": [{
          "picparam__id": "urlMongo"
        }]
      }
    };
    
    var myurl;
    if(req.body.dsSNS.eeConfig[0].serv_ip.startsWith("http")){
        myurl = req.body.dsSNS.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
    }else{
        myurl = 'http://' + req.body.dsSNS.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
    }    
       
    var result = {
      "token": req.body.idWeb || req.query.idWeb || req.headers['idWeb'],
      "socketi": req.app.get('io'),
      "arrayserv": req.body.dsSNS.env_msg_post,
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
  router.route('/sendSNS').post(function (req, res) {
    try {
      var result = parametros(req, res);
      SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
        try {

          if ((urlMongo === 4)) {
            throw urlMongo;
          }
          if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
            throw urlMongo;
          } else {
            urlMongo = urlMongo.eesic_param[0].param__val;
          }
          if ((result.arrayserv === undefined)) {
            throw msg_error[1];
          }
          if (result.arrayserv.length !== 0) {

            var eMessage = 
              {
                "message": {
                  "Message": result.arrayserv[0].eMessage,
                  "PhoneNumber": result.arrayserv[0].PhoneNumber
                },
                "config_update": {
                  "region": result.arrayserv[0].region,
                  "accessKeyId": result.arrayserv[0].accessKeyId,
                  "secretAccessKey": result.arrayserv[0].secretAccessKey
                },
                "AWS_SNS": {
                  "apiVersion": result.arrayserv[0].apiVersion
                }
              };
            AWS.config.update(eMessage.config_update);

            // Create promise and SNS service object
            var publishTextPromise = new AWS.SNS(eMessage.AWS_SNS).publish(eMessage.message).promise();
            publishTextPromise.then(
              function (data) {
                res.json("MessageID is " + data.MessageId);
                console.log("MessageID is " + data.MessageId);
                res.end();
              }).catch(
                function (err) {
                  res.json(err.stack);
                  console.error(err, err.stack);
                  res.end();
                });

          }
        } catch (e) {
          console.log("paso por acá   " + JSON.stringify(e));
          res.json(e);
          throw e;
        }
      }, function (error) {
        res.json(error);
        console.log(error + "serCUDbpm_task"); // Stacktrace
      });
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  });
};   