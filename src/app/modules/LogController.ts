import {AuthService, IAclActions} from "../service/AuthService";
import {BaseController} from "./BaseController";
import {IQueryResult} from "vesta-schema/ICRUDResult";
import {ILogger} from "../cmn/interfaces/ILogger";
import IDialogOptions = angular.material.IDialogOptions;
import IDialogService = angular.material.IDialogService;


export class LogController extends BaseController {
    public acl: IAclActions;

    public logs: Array<ILogger>;
    public static $inject = ['$mdDialog'];

    constructor(private $mdDialog: IDialogService) {
        super();
        this.fetchLogs();
    }

    private fetchLogs(filter?) {
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