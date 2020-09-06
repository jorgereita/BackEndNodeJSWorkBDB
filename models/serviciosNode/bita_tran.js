/**
 * modulo rest Api para el servicio de bitacora transaccional esta data no se almacena en mongodb solo usa socket
 * se montoó de esta manera para no desarmar el componente bitacora en la capa frontEnd
 * @param {*} router 
 * @param {*} io instancia socket clientye a la que se va a conectar
 * @param {*} fs 
 * @param {*} msg_error json de errores
 * @param {*} SIRsic_param servicio abl para obtener la url de bd mongo a la que se va a conectar 
 * @param {*} nodemailer paquerte de nodemailer 
 */
// var mongoose = require('mongoose');
// Load the AWS SDK for Node.js

// mongoose.Promise = global.Promise;
module.exports = function (router, io, fs, msg_error, SIRsic_param, nodemailer) {
    // var bpm_task_crud = require("../crud/bpm_task_crud");
    // var all_collections = require("../all_collections");
    // create reusable transporter object using the default SMTP transport
 /**
   * servicio para enviar mensajes
   */
  ////////////////////////parametros para todos los servicios/////////////////////////////////////////
  function parametros(req, res) {
    var body = {
      "dsSIRsic_param": {
        "eeDatos": req.body.dsMongo.eeDatos,
        "eeSIRsic_param": [{
          "picparam__id": "urlMongo"
        }]
      }
    };
    
    var myurl;
    if(req.body.dsMongo.eeConfig[0].serv_ip.startsWith("http")){
        myurl = req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
    }else{
        myurl = 'http://' + req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
    }
    
    var result = {
      "token": req.body.idWeb || req.query.idWeb || req.headers['idWeb'],
      "socketi": req.app.get('io'),
      "arrayserv": req.body.dsMongo.env_msg_sock,
      // "url":   req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param',
      "url": myurl,
      "qs": { idWeb: req.body.idWeb || req.query.idWeb || req.headers['idWeb'] },
      "body": body
    }
    return result;
  }
  router.route('/bita_tranAll').post(function (req, res) {
//      console.log(req.dsMail.);

    try {
        var result = parametros(req, res);
        console.log('pasó por acá')
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
//            for (var i = 0; i < result.arrayserv.length; i++) {
//              result.socketi.to("rooms:" + result.arrayserv[0].usr_cod).emit('bitacora', result.arrayserv);
              result.socketi.to("rooms:" + result.arrayserv[0].usr_cod).emit('cliSIRmsg_bitAll', result.arrayserv);
//            }
          }
          res.json({ eeEstados: [msg_error[0]], Body: req.body });
        } catch (e) {
          res.json(e);
          throw e;
        }
        res.end();
      }, function (error) {
        res.json(error);
        console.log(error + "serCUDbpm_task"); // Stacktrace
      });
    } catch (e) {
        console.log(e);
        res.json(e);
        res.end();
      }
    });


    router.route('/bita_tran').post(function (req, res) {
//      console.log(req.dsMail.);

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
//            for (var i = 0; i < result.arrayserv.length; i++) {
              result.socketi.to("rooms:" + result.arrayserv[0].usr_cod).emit('bitacora', result.arrayserv[0]);
              result.socketi.to("rooms:" + result.arrayserv[0].usr_cod).emit('cliSIRmsg_bit', result.arrayserv[0]);
//            }
          }
          res.json({ eeEstados: [msg_error[0]], Body: req.body });
        } catch (e) {
          res.json(e);
          throw e;
        }
        res.end();
      }, function (error) {
        res.json(error);
        console.log(error + "serCUDbpm_task"); // Stacktrace
      });
    } catch (e) {
        console.log(e);
        res.json(e);
        res.end();
      }
    });
};   
