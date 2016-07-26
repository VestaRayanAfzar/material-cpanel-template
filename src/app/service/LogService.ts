import {ApiService} from "./ApiService";
import {ClientApp} from "../ClientApp";
export class LogService {
    private static instance:LogService = null;
    public static $inject = ['apiService'];
    private isProduction = true;

    constructor(private apiService:ApiService) {
        LogService.instance = this;
        this.isProduction = ClientApp.Setting.env === 'production';
    }

    public log(log:any) {
        if (this.isProduction) {
            // todo what to do ???
        } else {
            console.log(log);
        }
    }

    public warn(log:any) {
        if (this.isProduction) {
            // todo what to do ???
        } else {
            console.warn(log);
        }
    }

    public info(log:any) {
        if (this.isProduction) {
            // todo what to do ???
        } else {
            console.info(log);
        }
    }

    public error(log:any) {
        if (this.isProduction) {
            // todo what to do ???
        } else {
            console.error(log);
        }
    }

    public static getInstance():LogService {
        return LogService.instance;
    }
}