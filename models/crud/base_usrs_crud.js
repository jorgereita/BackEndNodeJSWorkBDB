var mongoose = require('mongoose');
// mongoose.Promise = global.Promise;
var Base_usr = require("../../models/base/base_usrs");
/**
 * metodo crud para crear un registro en la tabla base_usrs
 	base_usrs_crud.save(data.urlMongo,data).then((successMessage) => {
      socket.emit('notificacion',successMessage);
    });
 * @param {*} urlMongo  parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} data el objeto que va a ingresar a la tabla
 */


module.exports.save = function (urlMongo, data) {
	return new Promise((resolve, reject) => {
		var d = new Date();
		var n = d.getUTCDate() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() + " " + (d.getUTCHours() - 5) + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();
		var newUsr = new Base_usr({
			socket: data.socket,
			usrId: data.usrId,
			onClick: "",
			onClose: "",
			onLoad: "",
			texto: data.texto,
			titulo: data.titulo,
			token: data.token,
			fuente: data.fuente,
		});
		newUsr.save(function (err, usrEnv) {
			if (err) {
				console.log('No se conectó  en save base_usr_crud:' + err);
				reject();
			} else {
				console.log("enviando usuario desde crud: " + n + +" " + data.usrId);
				resolve(usrEnv);
			}
		});
	});
}
/**
 * metodo para consultar todos los registros o documentos que hay en la tabla base_usrs segun el filtro
 * base_usrs_crud.find(data.urlMongo,{ usrId: data.usrId }).then((usr) => {
 * 		//lo que hace con la data
 * });
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
 */
module.exports.find = function (urlMongo, objFind) {
	return new Promise((resolve, reject) => {
		var d = new Date();
		var n = d.getUTCDate() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() + " " + (d.getUTCHours() - 5) + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();
		Base_usr.find(objFind,
			function (err, usr) {
				if (err) {
					console.log('No se conectó  en remove base_usr_crud:' + err);
					reject();
				} else {
					console.log("buscando usuario de crud: " + n + " " + objFind.usrId);
					resolve(usr);
				}
			});
	});
}
/**
* metodo para consultar todos los registros o documentos que hay en la tabla bpm_task y actualizarlos segun el query del update
* bpm_task_crud.find(data.urlMongo,{ usrId: data.usrId },data).then((usr) => {
* 		//lo que hace con la data
* });
* @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
* @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
* @param {*} objUpdate el objeto con los nodos que cambian
*/
module.exports.findOneAndUpdate = function (urlMongo, objFind, objUpdate) {
	return new Promise((resolve, reject) => {

		var d = new Date();
		var n = d.getUTCDate() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() + " " + (d.getUTCHours() - 5) + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();
		Base_usr.findOneAndUpdate(objFind, { $set: objUpdate }, { upsert: true }, function (err, usr) {
			if (err) {
				console.log('No se conectó  en remove base_usr_crud:' + err);
				reject(err);
			} else {
				if (usr === null) {
					console.log("buscando usuario de crud: " + n + " " + objFind.usrId);
					resolve(usr);
				} else if (usr.length !== 0) {
					resolve(usr);
				} else {
					resolve([{ mensaje: msg_error[6], usr_cod: objFind.usrId }])
				}
			}

		});
	});
}
/**
 * metodo para cambiar un registro en la tabla o colleccion base_usrs
 * base_usrs_crud.update(data.urlMongo,
                  { usrId: data.usrId },
                  {token: data.token, socket: socket.id}
                ).then((successMessage) => {
					///codigo que hace despues del cambio
				});
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind objeto para hacer el filtro
 * @param {*} objUpdate objeto con los nodos que van a cambiar
 */
module.exports.update = function (urlMongo, objFind, objUpdate) {
	return new Promise((resolve, reject) => {
		var d = new Date();
		var n = d.getUTCDate() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() + " " + (d.getUTCHours() - 5) + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();

		Base_usr.update(objFind, objUpdate, { upsert: true },
			function (err, usr) {
				if (err) {
					console.log('No se conectó  en update base_usr_crud:' + err);
					reject();
				} else {
					console.log("Actualizando usuario de crud: " + n + " " + objFind.usrId);
					resolve(usr);
				}
			});
	});
}
/**
 * metodo para remover un registro o una documento en la tabla o colecion base_usrs
 * base_usrs_crud.remove(data.urlMongo,{ token: data.token }).then((usr) => {
	  console.log(usr);
	}); 
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind obje para hacer el filtro de la consulta
 */
module.exports.remove = function (urlMongo, objFind) {
	return new Promise((resolve, reject) => {
		var d = new Date();
		var n = d.getUTCDate() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCFullYear() + " " + (d.getUTCHours() - 5) + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();
		Base_usr.remove(objFind,
			function (err, usr) {
				if (err) {
					console.log('No se conectó  en remove base_usr_crud:' + err);
					reject();
				} else {
					console.log("Borrando usuario de crud: " + n + " " + objFind.usrId);
					resolve(usr);
				}
			});
	});
}

