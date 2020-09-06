/**
 * modulo rest Api para el servicio de consulta de procesos
 * @param {*} router 
 * @param {*} io instancia socket clientye a la que se va a conectar
 * @param {*} fs 
 * @param {*} msg_error json de errores
 * @param {*} SIRsic_param servicio abl para obtener la url de bd mongo a la que se va a conectar 
 */
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
module.exports = function (router, io, fs, msg_error, SIRsic_param) {
    var proc_list_crud = require("../crud/proc_list_crud");
    var all_collections = require("../all_collections");
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
            "arrayserv": req.body.dsMongo.eebpm_proc,
            // "url":   req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param',
            "url": myurl,
            "qs": { idWeb: req.body.idWeb || req.query.idWeb || req.headers['idWeb'] },
            "body": body
        }
        return result;
    }
    /**
     * servicio para consultar la lista de procesos
     */
    router.route('/Serproc_list_crud').post(function (req, res) {
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
                     
                        for (var i = 0; i < result.arrayserv.length; i++) {
                            result.arrayserv[i].usr_cod = result.arrayserv[i].usr__cod || result.arrayserv[i].usr_cod;
                            result.socketi.to("rooms:" + result.arrayserv[i].usr_cod).emit('alerta', {"texto":"hola soy yo!"});     
                            proc_list_crud.find(urlMongo, { usr__cod: result.arrayserv[i].usr_cod }, result.arrayserv[i]).then( (response)=> {
                                
                                console.log(response);
                                res.json({ eeEstados: [msg_error[0]], Body: response });
                                res.end();
                            }
                                    ).catch(err => {
                                        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                         console.log('Error en removeAll del servicio: serCUDbpm_task put bpm_task.js')
                            });
                        
                        }
                    }
                 
                  
                } catch (e) {
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
}

