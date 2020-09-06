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
    // create reusable transporter object using the default SMTP transport
 /**
   * servicio para enviar mensajes
   */
  router.route('/send_mail_inter').post(function (req, res) {
//      console.log(req.dsMail.);
    try {
        var transporter = nodemailer.createTransport({
            pool: true,
            host: req.body.dsMail.eemail[0].smtphost,
            port: req.body.dsMail.eemail[0].smtpport,
            secure: req.body.dsMail.eemail[0].smtpsecure, // use TLS
            auth: {
                user: req.body.dsMail.eemail[0].smtpuser,
                pass: req.body.dsMail.eemail[0].smtppass
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
        var mailOptions = req.body.dsMail.eemail[0].mailOptions;
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: req.body.dsMail.eemail[0].efrom, // sender address
            to: req.body.dsMail.eemail[0].eto, // list of receivers
            subject: req.body.dsMail.eemail[0].subject, // Subject line
            text: req.body.dsMail.eemail[0].etext, // plaintext body
            html: req.body.dsMail.eemail[0].html, // html body
            attachments: req.body.dsMail.eemail[0].attachments || ""
        };
    
        // send mail with defined transport object callback
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.json('no se pudo enviar el mensaje: ' +error);
                res.end();
                return console.log(error);
            }
            res.json('Message sent: ' + info.response);
            console.log('Message sent: ' + info.response);
            res.end();
        });
    } catch (e) {
        console.log(e);
        res.json(e);
        res.end();
      }
    });
    
};   