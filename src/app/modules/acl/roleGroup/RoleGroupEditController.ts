import {AuthService, IAclActions} from "../../../service/AuthService";
import {BaseController} from "../../BaseController";
import {IQueryRequest, IQueryResult, IUpsertResult} from "vesta-schema/ICRUDResult";
import {IFormController} from "angular";
import {IRoleGroup, RoleGroup} from "../../../cmn/models/RoleGroup";
import {Err} from "vesta-util/Err";
import {ValidationError} from "vesta-schema/error/ValidationError";
import {IPromise, IQService} from "angular";
import {IRole} from "../../../cmn/models/Role";
import IDialogService = angular.material.IDialogService;


export class RoleGroupEditController extends BaseController {
    public acl: IAclActions;
    private roleGroupForm: IFormController;
    private roleGroup: RoleGroup;
    public static $inject = ['locals', '$mdDialog', '$q'];

    constructor(private locals: any, private $mdDialog: IDialogService, private $q: IQService) {
        super();
        this.apiService.get<IQueryRequest<IRoleGroup>, IQueryResult<IRoleGroup>>(`acl/roleGroup/${this.locals.id}`)
            .then(result=> this.roleGroup = new RoleGroup(result.items[0]))
            .catch(reason=> $mdDialog.cancel(reason));
    }

    public closeFormModal() {
        this.$mdDialog.cancel();
    }

    public searchRoles(searchText: string): IPromise<IRole|void> {
        return this.apiService.get<IRole, IQueryResult<IRole>>('role', {name: searchText})
            .then(result=> result.items)
            .catch(err=> this.notificationService.toast(`Failed fetching roles because of ${err.message}`))
    }

    public editRoleGroup() {
        if (!this.roleGroupForm.$dirty) return;
        let validate = this.formService.evaluate(this.roleGroup.validate(), this.roleGroupForm);
        if (!validate) return this.notificationService.toast('Invalid form data');
        let roleGroup = this.roleGroup.getValues<IRoleGroup>();
        this.apiService.put<IRoleGroup, IUpsertResult<IRoleGroup>>('acl/roleGroup', roleGroup)
            .then(result=> this.roleGroup.id = result.items[0].id)
            .then(()=> this.$mdDialog.hide(this.roleGroup))
            .catch(err=> {
                this.notificationService.toast(err.message);
                if (err.code == Err.Code.Validation) {
                    this.formService.evaluate((<ValidationError>err).violations, this.roleGroupForm);
                }
            });
    }

    public static registerPermissions() {
        AuthService.registerPermissions('acl.roleGroup', {'acl.roleGroup': ['read', 'update']});
    }
}