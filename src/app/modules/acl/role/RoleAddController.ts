import {AuthService, IAclActions} from "../../../service/AuthService";
import {BaseController} from "../../BaseController";
import {IUpsertResult, IQueryResult} from "vesta-schema/ICRUDResult";
import {IFormController} from "angular";
import {IRole, Role} from "../../../cmn/models/Role";
import {Err} from "vesta-util/Err";
import {ValidationError} from "vesta-schema/error/ValidationError";
import {IPromise, IQService} from "angular";
import {IPermission} from "../../../cmn/models/Permission";
import IDialogService = angular.material.IDialogService;


export class RoleAddController extends BaseController {
    public acl: IAclActions;
    private roleForm: IFormController;
    private role: Role;
    public static $inject = ['$mdDialog', '$q'];

    constructor(private $mdDialog: IDialogService, private $q: IQService) {
        super();
        this.role = new Role();
    }

    public closeFormModal() {
        this.$mdDialog.cancel();
    }

    public searchPermissions(searchText: string): IPromise<IPermission|void> {
        return this.apiService.get<IPermission, IQueryResult<IPermission>>('permission', {resource: searchText})
            .then(result=> result.items)
            .catch(err=> this.notificationService.toast(`Failed fetching permissions because of ${err.message}`))
    }

    public addRole() {
        let validate = this.formService.evaluate(this.role.validate(), this.roleForm);
        if (!validate) return this.notificationService.toast('Invalid form data');
        let role = this.role.getValues<IRole>();
        this.apiService.post<IRole, IUpsertResult<IRole>>('acl/role', role)
            .then(result=> this.role.id = result.items[0].id)
            .then(()=> this.$mdDialog.hide(this.role))
            .catch(err=> {
                this.notificationService.toast(this.translate(err.message));
                if (err.code == Err.Code.Validation) {
                    this.formService.evaluate((<ValidationError>err).violations, this.roleForm);
                }
            });
    }

    public static registerPermissions() {
        AuthService.registerPermissions('acl.role', {'acl.role': ['read', 'add']});
    }
}