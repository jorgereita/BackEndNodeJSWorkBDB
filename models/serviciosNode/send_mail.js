/**
 * modulo rest Api para el servicio bpm_task
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

  ////////////////////////parametros para todos los servicios/////////////////////////////////////////
  function parametros(req, res) {
    var body = {
      "dsSIRsic_param": {
        "eeDatos": req.body.dsMail.eeDatos,
        "eeSIRsic_param": [{
          "picparam__id": "urlMongo"
        }]
      }
    };
    
    var myurl;
    if(req.body.dsMail.eeConfig[0].serv_ip.startsWith("http")){
        myurl = req.body.dsMail.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
    }else{
        myurl = 'http://' + req.body.dsMail.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
    }         
    
    var result = {
      "token": req.body.idWeb || req.query.idWeb || req.headers['idWeb'],
      "socketi": req.app.get('io'),
      "arrayserv": req.body.dsMail.eemail,
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
  router.route('/send_mail').post(function (req, res) {
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

            // create reusable transporter object using the default SMTP transport

            var transporter = nodemailer.createTransport({
              pool: true,
              host: result.arrayserv[0].smtphost,
              port: result.arrayserv[0].smtpport,
              secure: result.arrayserv[0].smtpsecure, // use TLS
              auth: {
                user: result.arrayserv[0].smtpuser,
                pass: result.arrayserv[0].smtppass
              }
            });


            // verify connection configuration
            transporter.verify(function (error, success) {
              if (error) {
                console.log(error);
              } else {
                console.log("Server is ready to take our messages");
              }
            });
            var mailOptions = result.arrayserv[0].mailOptions; 
            // setup e-mail data with unicode symbols
            var mailOptions = {
              from: result.arrayserv[0].efrom, // sender address
              to: result.arrayserv[0].eto, // list of receivers
              subject: result.arrayserv[0].subject, // Subject line
              text: result.arrayserv[0].etext, // plaintext body
              html: result.arrayserv[0].html, // html body
              attachments: result.arrayserv[0].attachments||""
            };

            // send mail with defined transport object callback
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                res.json('Message sent: ' + error);
                res.end();
                return console.log(error);
              }
              res.json('Message sent: ' + info.response);
              console.log('Message sent: ' + info.response);
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