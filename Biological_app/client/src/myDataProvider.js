import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import env from "react-dotenv";
const MySwal = withReactContent(Swal);

const baseUrl = env.BACKEND_URL;
function errorParser(err, alert=true){
	try {
		if(alert)console.log(err.response.data.message);
		return err.response.data.message;
	} catch (e) {
		if(alert)logger.error(err);
		return err;
	}
}

const addUploadFeature = requestHandler => (type, resource, params) => {
	console.log(type, resource, params);
	try {
		if (type === "GET_ONE" && resource === "uploaded_data") {
			return new Promise((resolve, reject) => {
				axios({
					method: 'get',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
					url: '/uncheck_data_bird',
					'Content-Type': 'application/json',
					params: { id:params.id, st:0, num:1}
				}).then((response) => {
					let ret = { data: response.data.data[0] };
					ret.data.time = new Date(parseInt(ret.data.time)*1000).toLocaleString();
					resolve(ret);
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		}else if (type === "GET_LIST" && resource === "uploaded_data") {
			let query_parameter = {
				st: (params.pagination.page - 1) * params.pagination.perPage, 
				num: params.pagination.perPage, 
				filter:params.filter.q, 
				sort:params.sort.field, 
				order:params.sort.order,
				invalid:params.filter.invalid,
				startTime:params.filter.startTime,
				endTime:params.filter.endTime,
			};
			return new Promise((resolve, reject) => {
				axios({
					method: 'get',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
					url: '/uncheck_data_bird',
					'Content-Type': 'application/json',
					params: query_parameter
				}).then((response) => {
					let ret = { data: response.data.data, total: response.data.total };
					for (let i = 0; i < response.data.len ; i++){
						ret.data[i].time = new Date(parseInt(ret.data[i].time)*1000).toLocaleString();
					}
					resolve(ret);
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		} else if ((type === "DELETE") && resource === "uploaded_data") {
			return new Promise((resolve, reject) => {
						axios({
							method: 'delete',
							baseURL: baseUrl,
							headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
							url: '/data_bird',
							'Content-Type': 'application/json',
							params: {id:params.id, invalid:params.invalid}
						}).then(data => {
							resolve({data:params.previousData});
						}).catch(err => {
							reject(errorParser(err));
						});
					}
			);
		} else if ( type === "UPDATE_MANY" && resource === "uploaded_data") {
			return new Promise(async (resolve, reject) => {

				let rep = [];
				for (let i = 0; i < params.ids.length ; i++) {
					rep.push(
						axios({
							method: 'post',
							baseURL: baseUrl,
							headers: { "Authorization": "Bearer " + localStorage.getItem("JWT") },
							url: '/uncheck_data_bird',
							'Content-Type': 'application/json',
							data: {id:params.ids[i]}
						})
					);
					if(i % 3 == 0){
						const delay = ms => new Promise(res => setTimeout(res, ms));
						await delay(1000);
					}
				}
				Promise.all(rep).then(resList => {
					window.location.reload(false);
					resolve({ data:params.ids });
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		} else if (type === "UPDATE" && resource === "uploaded_data") {
				return new Promise((resolve, reject) => {
					let DateTime = new Date(params.data.time);
					params.data.time = DateTime.getTime();
					axios({
						method: 'put',
						baseURL: baseUrl,
						headers: { "Authorization": "Bearer " + localStorage.getItem("JWT") },
						url: '/data_bird',
						'Content-Type': 'application/json',
						data: params.data
					}).then(data => {
						resolve({ data: params.data });
					}).catch(err => {
						reject(errorParser(err));
					});
				});
		} else if (type === "GET_LIST" && resource === "backend_data") {
			let query_parameter = { 
				st: (params.pagination.page - 1) * params.pagination.perPage, 
				num: params.pagination.perPage, 
				filter:params.filter.q, 
				sort:params.sort.field, 
				order:params.sort.order,
				invalid:params.filter.invalid,
				startTime:params.filter.startTime,
				endTime:params.filter.endTime, 
				upload: true,
			};
			return new Promise((resolve, reject) => {
				axios({
					method: 'get',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
					url: '/uncheck_data_bird',
					'Content-Type': 'application/json',
					params: query_parameter
				}).then((response) => {
					let ret = { data: response.data.data, total: response.data.total };
					for (let i = 0; i < response.data.len ; i++){
						ret.data[i].time = new Date(parseInt(ret.data[i].time)*1000).toLocaleString();
					}
					resolve(ret);
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		}if (type === "GET_ONE" && resource === "backend_data") {
			return new Promise((resolve, reject) => {
				axios({
					method: 'get',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
					url: '/uncheck_data_bird',
					'Content-Type': 'application/json',
					params: { id:params.id, st:0, num:1, upload:true}
				}).then((response) => {
					let ret = { data: response.data.data[0] };
					ret.data.time = new Date(parseInt(ret.data.time)*1000).toLocaleString();
					resolve(ret);
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		} else if ((type === "DELETE") && resource === "backend_data") {
			return new Promise((resolve, reject) => {
						axios({
							method: 'delete',
							baseURL: baseUrl,
							headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
							url: '/data_bird',
							'Content-Type': 'application/json',
							params: {id:params.id, invalid:params.invalid}
						}).then(data => {
							resolve({data:params.previousData});
						}).catch(err => {
							reject(errorParser(err));
						});
					}
			);
		} else if (type === "UPDATE" && resource === "backend_data") {
			return new Promise((resolve, reject) => {
				let DateTime = new Date(params.data.time);
				params.data.time = DateTime.getTime();
				axios({
					method: 'put',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT") },
					url: '/data_bird',
					'Content-Type': 'application/json',
					data: params.data
				}).then(data => {
					resolve({ data: params.data });
				}).catch(err => {
					reject(errorParser(err));
				});
			});
	} else if (type === "GET_LIST" && resource === "user") {
			return new Promise((resolve, reject) => {
				axios({
					method: 'get',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
					url: '/user',
					'Content-Type': 'application/json',
					params: { st: (params.pagination.page - 1) * params.pagination.perPage, num: params.pagination.perPage, filter:params.filter.q, invalid:params.filter.invalid}
				}).then((response) => {
					let ret = { data: response.data.data, total: response.data.total };
					for (let i = 0; i < response.data.len ; i++){
						if(parseInt(ret.data[i].blocked_time) != 0	){
							ret.data[i].blocked_time = new Date(parseInt(ret.data[i].blocked_time)).toLocaleString();
						}else{
							ret.data[i].blocked_time = "None"
						}
					}
					resolve(ret);
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		}else if(type === "GET_ONE" && resource == "user"){
			return new Promise((resolve, reject) => {
				axios({
					method: 'get',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
					url: '/user',
					'Content-Type': 'application/json',
					params: { st: 0, num: 1, uuid: params.id}
				}).then((response) => {
					let ret = { data: response.data.data[0] };
					ret.data.blocked_time = new Date(parseInt(ret.data.blocked_time)).toLocaleString();
					resolve(ret);
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		} else if(type === "UPDATE" && resource == "user"){
			return new Promise((resolve, reject) => {
				let DateTime = new Date(params.data.time);
				params.data.time = DateTime.getTime();
				axios({
					method: 'put',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT") },
					url: '/user',
					'Content-Type': 'application/json',
					data: {account: params.data.user, email: params.data.email, uuid:params.data.id, name: params.data.name, phone: params.data.phone}
				}).then(data => {
					resolve({ data: params.data });
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		} else if(type === "DELETE" && resource == "user"){
			return new Promise((resolve, reject) => {
				axios({
					method: 'delete',
					baseURL: baseUrl,
					headers: { "Authorization": "Bearer " + localStorage.getItem("JWT")},
					url: '/user',
					'Content-Type': 'application/json',
					data: { uuid: params.previousData.id}
				}).then((response) => {
					resolve({data:params.previousData});
				}).catch(err => {
					reject(errorParser(err));
				});
			});
		}
		throw new Error("Unknow method" + String(type) + ' ' + String(resource));
    }catch(e){
			console.log(e);
			return new Promise(
				(resolve, reject) => {
					reject("Unknow error!!!");
				}
			);
    }
};

export default addUploadFeature;