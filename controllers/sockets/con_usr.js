
/**
 *  modulo para conectar el usuario a la base de datos de mongo y mantenerlo
 * en dicha bd activo mientras este logeado, esto para tener un control de los 
 * usuarios conectados a la plataforma. apárte le envia un mensaje de bienvenida
 * @param {*} socket instancia a la que se conecta, ojo depende de donde se llame es una instancia diferent  
 * @param {*} secret clave de seguridad en caso de que se adicione este parametro en los servicios
 * @param {*} jwt 
 * @param {*} fs para los archivos
 * @param {*} msg_error json de mensajes de error por si los necesita
 * @param {*} SIRsic_param servicio que llama para obtener la url de la conexion a bd mongo
 * @param {*} removeDupli metodo para eliminar los duplicados
 * @param {*} base_usrs_crud modelo para agregar los usuarios a la bd mongo
 * @param {*} base_bita_crud modelo para adicionar el mensaje de la bd mongo
 */
module.exports = function (socket,io,secret,jwt,fs,msg_error,SIRsic_param,removeDupli,base_usrs_crud,base_bita_crud) {
    socket.on('con_usr', function (data) {
      try {  
      var method = 'POST';
        var url = data.serv_ip + 'rest/Parameters/SIRsic_param';
        var qs = {idWeb:data.idWeb}
        var body = {
          "dsSIRsic_param": {
            "eeDatos": data.eeDatos,
            "eeSIRsic_param": [{
              "picparam__id": "urlMongo"
            }]
          }
        }; 
        
            SIRsic_param.SIRsic_param(method, url,qs, body).then((urlMongo) => {
          try {
            if ((urlMongo === 4)) {
              throw msg_error[4].Estado;
            }
            if ((urlMongo.eeEstados[0].Returnid!==0)) {
              throw urlMongo.eeEstados[0].Estado;
            }else{
              urlMongo = urlMongo.eesic_param[0].param__val;
            }
            var dataObj = data.env_not_sock[0]
            dataObj.socket = socket.id;
            socket.urlMongo = urlMongo;
            socket.usr_cod = dataObj.usrId;
            // base_usrs_crud.findOneAndUpdate(socket.urlMongo, { usrId: dataObj.usrId},
            //   {socket: dataObj.socket,token: dataObj.token}, dataObj).then((respuesta) => {
            //     removeDupli.find(socket.urlMongo);
            //     console.log("------------findOneAndUpdate----------------")
            //     console.log(respuesta)
            //     var romi = io.sockets.adapter.rooms["rooms:" + dataObj.usrId];
                
            //     console.log("------------findOneAndUpdate-----------fin-----")
            //     console.log(romi["sockets"])
            // }).catch(err=>{
            //   console.log(err);
            //   socket.emit('cerrarsession');
            //   console.log('Error en findOneAndUpdate del servicio:  socket on con_usr put con_usr.js')
            //   });
            base_usrs_crud.find(socket.urlMongo, { usrId: dataObj.usrId }).then((usr) => {
              if (usr.length === 0) {
                base_usrs_crud.save(socket.urlMongo, dataObj).then((successMessage) => {
                  console.log("Se ha conectado con exito el usuario: "+successMessage.usrId+"fecha : "+successMessage.time);
                  //remueve los registros duplicados
                  removeDupli.find(socket.urlMongo);
                }).catch(error => {
                  console.log(error.message)
                 });
              } else {
                dataObj.texto = "duplicaste la sesión."
                if (usr[0].token !== dataObj.token) {
                  var miPromise = new Promise((resolve, reject) => {
                    var romi = io.sockets.adapter.rooms["rooms:" + dataObj.usrId];
                    for (i in romi["sockets"]) {
                      if (i !== socket.id) {
                        console.log("Hay sesiones abiertas con el socket "); 
                        socket.to(i).emit('cerrarsession', dataObj);
                      }
                      resolve();
                    };
                  }).catch(error => {
                    console.log(error.message)
                    throw error.message
                   });
                  miPromise.then((successMessage) => {
                    base_usrs_crud.update(socket.urlMongo,
                      { usrId: dataObj.usrId },
                      { token: dataObj.token, socket: socket.id }
                    ).then((successMessage) => {
                      console.log("modificacion del usuario : " + successMessage+"fecha : "+successMessage.time);
                    }).catch(error => {
                      console.log(error.message)
                     });
                  }).catch(error => {
                    console.log(error.message)
                    throw error.message
                   });
                }
                socket.to("rooms:" + dataObj.usrId).emit('alerta', dataObj);
              }
              //carga las notificaciones pendientes
              // base_bita_crud.find(socket.urlMongo, { "usr_cod": dataObj.usrId,"sal_msg_vis": false },dataObj).then((not) => {
              //   socket.emit("sir_not_cli",not);
              // });
            }, function(error) {
              console.log(error + "con_usr"); // Stacktrace
            }).catch(error => {
              console.log(error.message)
              throw error.message
             });
          } catch (e) {
            console.log("Error: "+e);
            // throw e;
            socket.emit('cerrarsession',e);
          }
        }).catch(error => {
          // throw error.message
          console.log(JSON.stringify(error))
         });
      } catch (e) {
        console.log("Error: "+e);
        socket.emit('cerrarsession');
      }
      });
}