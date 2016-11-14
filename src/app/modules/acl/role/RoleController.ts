import {AuthService, IAclActions} from "../../../service/AuthService";
import {BaseController} from "../../BaseController";
import {IRole, Role} from "../../../cmn/models/Role";
import {IQueryRequest, IQueryResult} from "vesta-schema/ICRUDResult";
import {FieldType} from "vesta-schema/Field";
import {Permission} from "../../../cmn/models/Permission";
import {IDataTableOptions, IDataTableColumns} from "../../../directive/datatable";
import {Status} from "../../../cmn/enum/Status";
import IDialogOptions = angular.material.IDialogOptions;
import IDialogService = angular.material.IDialogService;


export class RoleController extends BaseController {
    public acl: IAclActions;
    private role: Role;
    private rolesList: Array<IRole> = [];
    private dtOptions: IDataTableOptions;
    private dtColumns: IDataTableColumns<IRole>;
    private busy: boolean = false;
    public static $inject = ['$mdDialog'];

    constructor(private $mdDialog: IDialogService) {
        super();
        this.metaTagsService.setTitle(this.translate('Role'));
        this.acl = this.authService.getActionsOn('role');
        this.initDataTable();
        this.fetchRoles({page: 1, limit: this.dtOptions.limit});
    }

    public initDataTable() {
        this.dtOptions = this.getDataTableOptions({pagination: false, search: false});
        this.dtOptions.operations = {
            read: this.fetchRoles.bind(this),
            add: this.acl[Permission.Action.Add] ? this.addRole.bind(this) : null,
            edit: this.acl[Permission.Action.Edit] ? this.editRole.bind(this) : null,
            del: this.acl[Permission.Action.Delete] ? this.delRole.bind(this) : null
        };
        this.dtColumns = {
            name: {
                text: this.translate('name'),
                type: FieldType.String
            },
            status: {
                text: this.translate('status'),
                type: FieldType.Enum,
                render: (role: Role)=> this.translate(Status[role.status]),
                options: Status
            }
        };
    }

    public fetchRoles(option: IQueryRequest<IRole>) {
        if (this.busy) return;
        this.busy = true;
        this.apiService.get<IQueryRequest<IRole>, IQueryResult<IRole>>('acl/role', option)
            .then(result=> {
                this.rolesList = result.items;
                this.busy = false;
            })
            .catch(err=> {
                this.notificationService.toast(this.translate(err.message));
                this.busy = false;
            });
        if (option.page == 1) {
            this.apiService.get<IQueryRequest<IRole>, IQueryResult<IRole>>('acl/role/count', option)
                .then(result=> this.dtOptions.total = result.total)
                .catch(err=> this.notificationService.toast(this.translate(err.message)));
        }
    }

    public addRole(event: MouseEvent) {
        this.$mdDialog.show(<IDialogOptions>{
            controller: 'roleAddController',
            controllerAs: 'vm',
            templateUrl: 'tpl/acl/role/roleAddForm.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then((role) => {
            this.rolesList.push(role);
            this.notificationService.toast(this.translate('info_add_record', this.translate('role')));
        }).catch(err=> err && this.notificationService.toast(this.translate(err.message)))
    }

    public editRole(event: MouseEvent, index: number) {
        let roleId = this.rolesList[index].id;
        this.$mdDialog.show(<IDialogOptions>{
            controller: 'roleEditController',
            controllerAs: 'vm',
            templateUrl: 'tpl/acl/role/roleEditForm.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {id: roleId}
        }).then((role: IRole) => {
            this.rolesList[this.findByProperty(this.rolesList, 'id', role.id)] = role;
            this.notificationService.toast('role has been updated successfully');
        }).catch(err=> this.notificationService.toast(this.translate(err.message)))
    }

    public delRole(event: MouseEvent, index: number) {
        let roleId = this.rolesList[index].id;
        let confirm = this.$mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('title_delete_confirm')
            .textContent(this.translate('msg_delete_confirm', this.translate('role')))
            .targetEvent(event)
            .ok(this.translate('yes')).cancel(this.translate('no'));
        this.$mdDialog.show(confirm)
            .then(()=> this.apiService.delete(`acl/role/${roleId}`))
            .then(()=> {
                this.rolesList.splice(this.findByProperty(this.rolesList, 'id', roleId), 1);
                this.notificationService.toast(this.translate('info_delete_record', this.translate('role')));
            })
            .catch(err=> this.notificationService.toast(this.translate(err.message)));
    }

    public static registerPermissions() {
        AuthService.registerPermissions('acl.role', {'acl.role': ['read']});
    }
}