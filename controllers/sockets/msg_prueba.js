
/**
 *  modulo para obtener los mensajes asociados a una sala o usuario
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


module.exports = function (socket, io, secret, jwt, fs, msg_error, SIRsic_param, removeDupli, base_usrs_crud) {
    ////////////////////////parametros para todos los servicios/////////////////////////////////////////
    var proc_list_crud = require("../../models/crud/proc_list_crud");
    function parametros(req) {
        try {
            var body = {
                "dsSIRsic_param": {
                    "eeDatos": req.dsMongo.eeDatos,
                    "eeSIRsic_param": [{
                        "picparam__id": "urlMongo"
                    }]
                }
            };
            var obj = req.dsMongo.eebpm_msg_pru[0];
            obj.usr_cod = obj.usr_cod || obj["usr-cod"] || obj["usr__cod"] || obj["usr--cod"];
            var result = {
                "token": req.dsMongo.eeConfig[0].idWeb || req.query.idWeb || req.headers['idWeb'],
                // "socketi":req.app.get('io'),
                "arrayserv": req.dsMongo.eebpm_msg_pru,
                "url": req.dsMongo.eeConfig[0].serv_ip + 'rest/Parameters/SIRsic_param',
                "qs": { idWeb: req.dsMongo.eeConfig[0].idWeb || req.query.idWeb || req.headers['idWeb'] },
                "body": body
            }
            console.log(result.qs)
            return result;
        } catch (e) {
            console.log(e)
            throw e;
        }
    }
    socket.on('serSIRbpm_task_msg_pru', function (data) {
        try {
//        console.log(data.dsMongo.eeConfig[0])
            var result = parametros(data);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                          result.arrayserv[0].usr_cod = result.arrayserv[0].usr__cod || result.arrayserv[0].usr_cod;
                          console.log(result.arrayserv[0].usr_cod )
                        proc_list_crud.find(urlMongo, { usr_cod: result.arrayserv[0].usr_cod  }, result.arrayserv[0]).then((respFind) => {
                           
                                result.socketi.to("rooms:" + result.arrayserv[0].usr_cod).emit('alerta', {"texto":JSON.stringify()});     
                           
                        }).catch(err => {
                            console.log(err)
                            socket.emit('alerta', err);
                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                            console.log('Error en all_collections find del servicio:  socket serUbpm_taskBitacora put bpm_task.js')
                        });
                    }
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }).catch(err => {
                console.log(err)
                socket.emit('alerta', err);
                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });
}