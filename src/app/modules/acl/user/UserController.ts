import {AuthService, IAclActions} from "../../../service/AuthService";
import {BaseController} from "../../BaseController";
import {IUser, User, UserGender} from "../../../cmn/models/User";
import {IQueryRequest, IQueryResult} from "vesta-schema/ICRUDResult";
import {FieldType} from "vesta-schema/Field";
import {Permission} from "../../../cmn/models/Permission";
import {IDataTableOptions, IDataTableColumns} from "../../../directive/datatable";
import IDialogOptions = angular.material.IDialogOptions;
import IDialogService = angular.material.IDialogService;


export class UserController extends BaseController {
    public acl: IAclActions;
    private user: User;
    private usersList: Array<IUser> = [];
    private dtOptions: IDataTableOptions;
    private dtColumns: IDataTableColumns<IUser>;
    private busy: boolean = false;
    public static $inject = ['$mdDialog'];

    constructor(private $mdDialog: IDialogService) {
        super();
        this.metaTagsService.setTitle('User');
        this.acl = this.authService.getActionsOn('user');
        this.initDataTable();
        this.fetchUsers({page: 1, limit: this.dtOptions.limit});
    }

    public initDataTable() {
        this.dtOptions = this.getDataTableOptions();
        this.dtOptions.operations = {
            read: this.fetchUsers.bind(this),
            add: this.acl[Permission.Action.Add] ? this.addUser.bind(this) : null,
            edit: this.acl[Permission.Action.Edit] ? this.editUser.bind(this) : null,
            del: this.acl[Permission.Action.Delete] ? this.delUser.bind(this) : null
        };
        this.dtColumns = {
            username: {
                text: this.translate('username'),
                type: FieldType.String
            },
            firstName: {
                text: this.translate('firstName'),
                type: FieldType.String
            },
            lastName: {
                text: this.translate('lastName'),
                type: FieldType.String
            },
            email: {
                text: this.translate('email'),
                type: FieldType.EMail
            },
            birthDate: {
                text: this.translate('birthDate'),
                type: FieldType.Timestamp
            },
            gender: {
                text: this.translate('gender'),
                type: FieldType.Enum,
                render: (user: User)=> this.translate(UserGender[user.gender]),
                options: UserGender
            }
        };
    }

    public fetchUsers(option: IQueryRequest<IUser>) {
        if (this.busy) return;
        this.busy = true;
        this.apiService.get<IQueryRequest<IUser>, IQueryResult<IUser>>('acl/user', option)
            .then(result=> {
                this.usersList = result.items;
                this.busy = false;
            })
            .catch(err=> {
                this.notificationService.toast(this.translate(err.message));
                this.busy = false;
            });
        if (option.page == 1) {
            this.apiService.get<IQueryRequest<IUser>, IQueryResult<IUser>>('acl/user/count', option)
                .then(result=> this.dtOptions.total = result.total)
                .catch(err=> this.notificationService.toast(this.translate(err.message)));
        }
    }

    public addUser(event: MouseEvent) {
        this.$mdDialog.show(<IDialogOptions>{
            controller: 'userAddController',
            controllerAs: 'vm',
            templateUrl: 'tpl/acl/user/userAddForm.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then((user) => {
            this.usersList.push(user);
            this.notificationService.toast(this.translate('info_add_record', this.translate('user')));
        }).catch(err=> err && this.notificationService.toast(this.translate(err.message)))
    }

    public editUser(event: MouseEvent, index: number) {
        let userId = this.usersList[index].id;
        this.$mdDialog.show(<IDialogOptions>{
            controller: 'userEditController',
            controllerAs: 'vm',
            templateUrl: 'tpl/acl/user/userEditForm.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {id: userId}
        }).then((user: IUser) => {
            this.usersList[this.findByProperty(this.usersList, 'id', user.id)] = user;
            this.notificationService.toast('user has been updated successfully');
        }).catch(err=> this.notificationService.toast(this.translate(err.message)))
    }

    public delUser(event: MouseEvent, index: number) {
        let userId = this.usersList[index].id;
        let confirm = this.$mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('title_delete_confirm')
            .textContent(this.translate('msg_delete_confirm', this.translate('user')))
            .targetEvent(event)
            .ok(this.translate('yes')).cancel(this.translate('no'));
        this.$mdDialog.show(confirm)
            .then(()=> this.apiService.delete(`acl/user/${userId}}`))
            .then(()=> {
                this.usersList.splice(this.findByProperty(this.usersList, 'id', userId), 1);
                this.notificationService.toast(this.translate('info_delete_record', this.translate('user')));
            })
            .catch(err=> this.notificationService.toast(this.translate(err.message)));
    }

    public static registerPermissions() {
        AuthService.registerPermissions('acl.user', {'acl.user': ['read']});
    }
}