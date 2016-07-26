import {IStateService} from "angular-ui-router";
import {AuthService} from "../../service/AuthService";
import {IQueryResult} from "vesta-schema/ICRUDResult";
import {IUser} from "../../cmn/models/User";
import {BaseController} from "../BaseController";

export class LogoutController extends BaseController {
    public static $inject = ['$state'];

    constructor($state:IStateService) {
        super();
        this.authService.logout();
        this.apiService.get<any, IQueryResult<IUser>>('account/logout')
            .then(result=> {
                this.authService.updateUser(result.items[0]);
        $state.go('login');
            });
    }

    static registerPermissions() {
        AuthService.registerPermissions('logout');
    }
}