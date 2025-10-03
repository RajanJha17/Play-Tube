export default class CustomError extends Error {
  statusCode = 500;
  timestamp = new Date().toISOString();
  data: any
  constructor({ statusCode, message, data }: { statusCode: number, message: string, data?: any }) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
