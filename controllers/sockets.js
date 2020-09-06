module.exports = function (io, request) {



  // var Chat_usr = require("../models/chat/chat_usrs");
  // var Chat_msg = require("../models/chat/chat_msgs");
  // var Chat_sla = require("../models/chat/chat_slas");

  var base_usrs_crud = require("../models/crud/base_usrs_crud");
  var usrbd_abl_crud = require("../models/crud/usrbd_abl_crud");
  var base_bita_crud = require("../models/crud/base_bita_crud");
  var servPru = require("../models/restabl/serv_pru");
  var SIRsic_param = require("../models/restabl/SIRsic_param");
  var fs = require('fs');
  var msg_error = JSON.parse(fs.readFileSync('msg_error.json')).id_msg;


  //////////////////////////////////////////////////////////////////////////

  var secret = require('../secret');
  var jwt = require('jsonwebtoken');


  ///////////////////////////////////////////////////////////////////////////////

  var nicknames = [];
  var users = {};
  var usernames = {};
  io.sockets.on('connection', function (socket) {
    socket.auth = false;
    socket.join("default");
    socket.on('autenticathe', function (token) {
      jwt.verify(token, secret.passToken, function (err, decoded) {
        if (err) {
          console.log("No tiene permisos");
        } else {
          socket.auth = true;
          console.log("tiene permisos")
        }
      });

    });

    socket.on('disconnect', function (data) {
      try {
        var d = new Date();
        var n = d.getUTCDate() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() + " " + (d.getUTCHours() - 5) + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();
        console.log("Usuario desconectado en disconnect")
        console.log("Usuario: "+ socket.usr_cod +" Serv mongo:"+ socket.urlMongo);
        base_usrs_crud.find(socket.urlMongo, { usrId: socket.usr_cod }).then((usr) => {
          if (usr.length !== 0) {
            console.log(usr);
            console.log('socket ' + this.id + ' disconnect ' + usr[0].usrId + '---' + n);
            if(this.id == usr[0].socket){
              socket.to("rooms:" + usr[0].usrId).emit('cerrarsession', usr[0]);
              base_usrs_crud.remove(socket.urlMongo, { usrId: usr[0].usrId }).then((usr2) => {
                console.log(usr2);
              }).catch(err=>{
                console.log(err)
                console.log('Error en disconnect find del servicio:  socket disconnect remove sockets.js')
                });
            }
          }
        
        }).catch(error => {
          console.log(error.message)
          throw error.message
         });; 
      } catch (e) { console.log("Error al desconectarse disconnect: " + e) }
    });

    socket.on('desconectar', function (data) {
      try {
        console.log("usuario desconectado en desconectar" + data.usrId)
        var romi = io.sockets.adapter.rooms["rooms:" + data.usrId];
        console.log(romi["sockets"])
        if (Object.keys(romi["sockets"]).length === 1) {
          base_usrs_crud.remove(socket.urlMongo, { usrId: data.usrId }).then((usr) => {
            console.log(usr);
          
          }).catch(error => {
            console.log(error.message)
            // throw error.message
           });
        }
      } catch (e) { console.log("Error al desconectarse desconectar: " + e) }
    });

    socket.on('end', function () {
      var i = global_sockets_list.indexOf(socket);
      global_sockets_list.splice(i, 1);
      console.log("end socket")
    });


    //////////////////////////////////////roooms////////////////////////////////////////////////////////////////////////
    socket.on('subscribe', function (data) {
      console.log("sala suscrita " + data.room);
      socket.join(data.room);
    }
    )

    socket.on('unsubscribe', function (data) { socket.leave(data.room); })
    // //////////////////////////////////////roooms////////////////////////////////////////////////////////////////////////
    // socket.on('sir_not_ser', function (datos) {
    //   // console.log("paso por notificaciones...........................................................");
    //   // conosole.log()
    //   // if (socket.auth) {
    //     console.log("paso por notificaciones...........................................................");
        
    //   // }
    // });
    //////////////////////////////////////enviar mensajes falta enviarlo al servidor////////////////////////////////////////////////////////////////////////
    socket.on('enviar', function (datos) {
      if (socket.auth) {
        var res = datos.mensaje.match(/(@\w*) */g);
        if (res !== null) {
          for (var i = 0; i < res.length; i++) {
            usrtag = res[i].replace(/(@)(\w*)( )*/g, '$2');
            if (usrtag === 'sumamarcador') {
              io.to("default").emit('sumaMarcador', datos)
            } else {
              users[usrtag].emit('mensaje', datos)
            }
          }
          users[datos.user].emit('mensaje', datos);
        } else {
          if (datos.sala === "") {
            io.to("default").emit('mensaje', datos);
          } else {
            io.to(datos.sala).emit('mensaje', datos);
          }
        }

      }

    });
    //////////////////////////////////////enviar mensajes falta enviarlo al servidor////////////////////////////////////////////////////////////////////////
    socket.on('sir_chat_msg', function (datos) {
      if (socket.auth) {
        var res = datos.mensaje.match(/(@\w*) */g);
        if (res !== null) {
          for (var i = 0; i < res.length; i++) {
            usrtag = res[i].replace(/(@)(\w*)( )*/g, '$2');
            if (usrtag === 'sumamarcador') {
              io.to("default").emit('sumaMarcador', datos)
            } else {
              users[usrtag].emit('mensaje', datos)
            }
          }
          users[datos.user].emit('mensaje', datos);
        } else {
          if (datos.sala === "") {
            io.to("default").emit('mensaje', datos);
          } else {
            io.to(datos.sala).emit('mensaje', datos);
          }
        }

      }

    });
    

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.on('env_msg', function (data) {
      console.log(data);
      var method = 'POST';
      var url = 'http://172.21.24.196:17000/notificacion';
      var qs = { idWeb: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWxleF84MDAwMDE1NDEifQ.wmPnbO-G75UspHuNnCt3Upim3u27UkIeVEKoiQ_bhak' };
      var body = {
        transmision: 'unicast',
        texto: "mensaje enviado desde: " + data.mensaje,
        userId: data.mensaje,
        userssend: '',
        grupos: '',
        onClick: '',
        onClose: '',
        onLoad: 'cerrarSesionSocket',
        titulo: 'Buen dia',
        token: ''
      };
      // console.log(servPru)
      // var servPru = require("../models/restabl/serv_pru");
      servPru.servAbl(method, url, qs, body).then((usr) => {
        console.log(usr);
      }, function(error) {
        console.log(error + "socket"); 
      }).catch(error => {
        console.log(error.message)
        throw error.message
       });;
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////

    
    /////////////////////////////////////////////////////////////////////////
    socket.on('broadcast', function (data) {
      socket.broadcast.emit('notificacion', data.mensaje);
    });
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////modelo de creación de sockets/////////////////////////////////////////////////////////
    
    var removeDupli = require("../models/rem_dupli");
    require("./sockets/con_usr")(socket,io,secret,jwt,fs,msg_error,SIRsic_param,removeDupli,base_usrs_crud,base_bita_crud);
    require("./sockets/sir_msg")(socket,io,secret,jwt,fs,msg_error,SIRsic_param,removeDupli,base_usrs_crud,base_bita_crud);
    require("./sockets/bpm_task")(socket,io,secret,jwt,fs,msg_error,SIRsic_param,removeDupli,base_usrs_crud);
    require("./sockets/msg_prueba")(socket,io,secret,jwt,fs,msg_error,SIRsic_param,removeDupli,base_usrs_crud);
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
  });
}

/**
 * para eliminar todos los duplicados
 * db.base_usrs.aggregate([
    { "$group": {
        "_id": { "socket": "$socket" },
        "dups": { "$push": "$_id" },
        "count": { "$sum": 1 }
    }},
    { "$match": { "count": { "$gt": 1 } }}
]).forEach(function(doc) {
    doc.dups.shift();
    db.base_usrs.remove({ "_id": {"$in": doc.dups }});
});
 */