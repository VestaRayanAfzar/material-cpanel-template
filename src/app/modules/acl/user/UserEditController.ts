import {AuthService, IAclActions} from "../../../service/AuthService";
import {BaseController} from "../../BaseController";
import {IQueryRequest, IQueryResult, IUpsertResult} from "vesta-schema/ICRUDResult";
import {IFormController} from "angular";
import {IUser, User} from "../../../cmn/models/User";
import {Err} from "vesta-util/Err";
import {ValidationError} from "vesta-schema/error/ValidationError";
import {IFileKeyValue} from "../../../service/ApiService";
import {IPromise, IQService} from "angular";
import {IRoleGroup} from "../../../cmn/models/RoleGroup";
import IDialogService = angular.material.IDialogService;


export class UserEditController extends BaseController {
    public acl: IAclActions;
    private userForm: IFormController;
    private user: User;
    public static $inject = ['locals', '$mdDialog', '$q'];

    constructor(private locals: any, private $mdDialog: IDialogService, private $q: IQService) {
        super();
        this.metaTagsService.setTitle(this.translate('title_record_edit', this.translate('User')));
        
        this.apiService.get<IQueryRequest<IUser>, IQueryResult<IUser>>(`acl/user/${this.locals.id}`)
            .then(result=> {
                this.user = new User(result.items[0]);
                this.user.image = `${this.Setting.asset}/user/${this.user.image}`;
            })
            .catch(reason=> $mdDialog.cancel(reason));
    }

    public closeFormModal() {
        this.$mdDialog.cancel();
    }

    public searchRoleGroups(searchText: string): IPromise<IRoleGroup|void> {
        return this.apiService.get<IRoleGroup, IQueryResult<IRoleGroup>>('roleGroup', {name: searchText})
            .then(result=> result.items)
            .catch(err=> this.notificationService.toast(`Failed fetching roleGroups because of ${err.message}`))
    }

    public editUser() {
        if (!this.userForm.$dirty) return;
        let validate = this.formService.evaluate(this.user.validate(), this.userForm);
        if (!validate) return this.notificationService.toast('Invalid form data');
        let user = this.user.getValues<IUser>();
        let files: IFileKeyValue = {};
        if (user.image && typeof user.image !== 'string') files['image'] = <File>user.image;
        delete user.image;
        this.apiService.put<IUser, IUpsertResult<IUser>>('acl/user', user)
            .then(result=> {
                this.user.id = result.items[0].id;
                if (Object.keys(files).length) return this.upload(`acl/user/file/${this.user.id}`, files);
            })
            .then(()=> this.$mdDialog.hide(this.user))
            .catch(err=> {
                this.notificationService.toast(err.message);
                if (err.code == Err.Code.Validation) {
                    this.formService.evaluate((<ValidationError>err).violations, this.userForm);
                }
            });
    }

    public static registerPermissions() {
        AuthService.registerPermissions('acl.user', {'acl.user': ['read', 'update']});
    }
}