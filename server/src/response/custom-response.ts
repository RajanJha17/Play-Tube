export default class CustomResponse {
	statusCode: number;
	message: string;
	data: any;
	constructor({ statusCode, message, data }: { statusCode: number, message: string, data: any }) {
		this.statusCode = statusCode;
		this.message = message;
		this.data = data;
	}
}
