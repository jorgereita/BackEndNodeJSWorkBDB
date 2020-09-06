/**
 * modulo rest Api para enviar notificaciones al usuario cliente
 * @param {*} router 
 * @param {*} io instancia socket clientye a la que se va a conectar
 * @param {*} fs 
 * @param {*} msg_error json de errores
 * @param {*} SIRsic_param servicio abl para obtener la url de bd mongo a la que se va a conectar 
 */
module.exports = function (router,io,fs,msg_error,SIRsic_param) {
    router.post('/notificacion', function (req, res) {

        var socketi = req.app.get('io');
        var transmision = req.body.dsMongo.eeConfig[0].transmision;
        var respuestaServ = 'mensaje enviado a: ';
        var objMensaje = req.body.dsMongo.eenotificacion;
      
        try {
          if (transmision === "multicast") {
            if ((objMensaje === undefined)) {
              throw 'Para enviar un multicast es necesario tener el campo eenotificacion o grupos de la siguiente forma "userssend":[{"userId":"z000003_800001541"},{"userId":"z000004_800001541"}], o "grupos":[{"salaId":""}],';
            }
            if (objMensaje.length !== 0) {
              for (var i = 0; i < objMensaje.length; i++) {
                socketi.to("rooms:" + objMensaje[i].usr_cod).emit('notificacion', objMensaje[i]);
                // socketi.to("rooms:"+ req.body.userssend[i].userId).emit('alerta',req.body);
              }
            } else if (req.body.grupos.length !== 0) {
              for (var i = 0; i < req.body.grupos.length; i++) {
                socketi.to("rooms:" + req.body.userssend[i].salaId).emit('notificacion', req.body);
                // socketi.to("rooms:"+ req.body.grupos[i].salaId).emit('alerta',req.body);
              }
            }
          } else if (transmision === "unicast") {
            // socketi.to("rooms:" + req.body.userId).emit('notificacion', req.body);
            socketi.to("rooms:" + req.body.usr_cod).emit('alerta', req.body);
          } else if (transmision === "broadcast") {
            socketi.volatile.emit('notificacion', req.body);
            respuestaServ = 'se envio a todos los usuarios conectados pero no es seguro que todos los usuario lo recibieron, depende de la coneccion de cada cliente';
            // socketi.volatile.emit('alerta',req.body);
          } else {
            respuestaServ = 'no se pudo enviar el mensaje a: ';
          }
      
          // console.log(req.body)
          res.json({
            "dsmongo": {
                "eeEstados": [msg_error[0]],
                "eebpm_task": respuestaServ
            }
        });
          // res.json({ respuesta: respuestaServ + req.body.userId, mensaje: req.body });
        } catch (e) {
          res.json({
            "dsmongo ": {
                "eeEstados": [{"Estado": e,
                "Returnid": 20}]
            }
        });
          res.json({ respuesta: e, mensaje: req.body });
        }
        res.end();
      });
}
