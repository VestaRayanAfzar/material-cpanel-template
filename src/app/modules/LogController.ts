import {AuthService, IAclActions} from "../service/AuthService";
import {BaseController} from "./BaseController";
import {IQueryResult} from "vesta-schema/ICRUDResult";
import {ILogger} from "../cmn/interfaces/ILogger";


export class LogController extends BaseController {
    public acl: IAclActions;
    public logs: Array<ILogger>;
    public static $inject = [];

    constructor() {
        super();
        this.fetchLogs();
    }

    private fetchLogs(filter?) {
        console.log(filter);
        this.apiService.get<ILogger, IQueryResult<ILogger>>('log', filter)
            .then(result=> {
                this.logs = result.items;
            })
            .catch(reason=> {
                console.error(reason);
            });
    }


    public static registerPermissions() {
        AuthService.registerPermissions('log', {'log': ['read']});
    }
}