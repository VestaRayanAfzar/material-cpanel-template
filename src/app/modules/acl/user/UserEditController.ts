import {IUser, User} from "../../../cmn/models/User";
import {Err} from "vesta-util/Err";
import {IQueryRequest, IQueryResult, IUpsertResult} from "vesta-schema/ICRUDResult";
import {IFormController} from "angular";
import {BaseController} from "../../BaseController";
import IDialogService = angular.material.IDialogService;


export class UserEditController extends BaseController {
    private user:User;
    private userForm:IFormController;
    public static $inject = ['$mdDialog', 'locals'];

    constructor(private $mdDialog:IDialogService, private locals:any) {
        super();
        this.apiService.get<IQueryRequest<IUser>, IQueryResult<IUser>>('acl/user/' + this.locals.id)
            .then(result=> {
                if (result.error) return $mdDialog.cancel(result.error);
                this.user = new User(result.items[0]);
            })
            .catch(reason=>$mdDialog.cancel(reason));

    }

    public closeFormModal() {
        this.$mdDialog.cancel();
    }

    public editUser() {
        if (this.userForm.$dirty == false) {
            this.$mdDialog.cancel();
            return;
        }
        var validate = this.formService.evaluate(this.user.validate(), this.userForm);
        if (!validate) return;
        var user = this.user.getValues<IUser>();
        this.apiService.put<IUser, IUpsertResult<IUser>>('acl/user', user)
            .then(result=> {
                if (result.error) {
                    if (result.error.code == Err.Code.Validation) {
                        this.formService.evaluate(result.error['violations'], this.userForm);
                    }
                    return this.notificationService.toast(result.error.message);
                }
                this.$mdDialog.hide(result.items[0]);
            })
            .catch(reason=> {
                this.$mdDialog.cancel(reason);
            });
    }
}