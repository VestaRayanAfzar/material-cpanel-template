import {AuthService, IAclActions} from "../../../service/AuthService";
import {BaseController} from "../../BaseController";
import {IRoleGroup, RoleGroup} from "../../../cmn/models/RoleGroup";
import {IQueryRequest, IQueryResult} from "vesta-schema/ICRUDResult";
import {FieldType} from "vesta-schema/Field";
import {Permission} from "../../../cmn/models/Permission";
import {IDataTableOptions, IDataTableColumns} from "../../../directive/datatable";
import {Status} from "../../../cmn/enum/Status";
import IDialogOptions = angular.material.IDialogOptions;
import IDialogService = angular.material.IDialogService;


export class RoleGroupController extends BaseController {
    public acl: IAclActions;
    private roleGroup: RoleGroup;
    private roleGroupsList: Array<IRoleGroup> = [];
    private dtOptions: IDataTableOptions;
    private dtColumns: IDataTableColumns<IRoleGroup>;
    private busy: boolean = false;
    public static $inject = ['$mdDialog'];

    constructor(private $mdDialog: IDialogService) {
        super();
        this.metaTagsService.setTitle(this.translate('RoleGroup'));
        this.acl = this.authService.getActionsOn('roleGroup');
        this.initDataTable();
        this.fetchRoleGroups({page: 1});
    }

    public initDataTable() {
        this.dtOptions = this.getDataTableOptions({pagination: false, search: false});
        this.dtOptions.operations = {
            read: this.fetchRoleGroups.bind(this),
            add: this.acl[Permission.Action.Add] ? this.addRoleGroup.bind(this) : null,
            edit: this.acl[Permission.Action.Edit] ? this.editRoleGroup.bind(this) : null,
            del: this.acl[Permission.Action.Delete] ? this.delRoleGroup.bind(this) : null
        };
        this.dtColumns = {
            name: {
                text: this.translate('name'),
                type: FieldType.String
            },
            status: {
                text: this.translate('status'),
                type: FieldType.Enum,
                render: (roleGroup: RoleGroup)=> this.translate(Status[roleGroup.status]),
                options: Status
            }
        };
    }

    public fetchRoleGroups(option: IQueryRequest<IRoleGroup>) {
        if (this.busy) return;
        this.busy = true;
        this.apiService.get<IQueryRequest<IRoleGroup>, IQueryResult<IRoleGroup>>('acl/roleGroup', option)
            .then(result=> {
                this.roleGroupsList = result.items;
                this.busy = false;
            })
            .catch(err=> {
                this.notificationService.toast(this.translate(err.message));
                this.busy = false;
            });
    }

    public addRoleGroup(event: MouseEvent) {
        this.$mdDialog.show(<IDialogOptions>{
            controller: 'roleGroupAddController',
            controllerAs: 'vm',
            templateUrl: 'tpl/acl/roleGroup/roleGroupAddForm.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then((roleGroup) => {
            this.roleGroupsList.push(roleGroup);
            this.notificationService.toast(this.translate('info_add_record', this.translate('roleGroup')));
        }).catch(err=> err && this.notificationService.toast(this.translate(err.message)))
    }

    public editRoleGroup(event: MouseEvent, index: number) {
        let roleGroupId = this.roleGroupsList[index].id;
        this.$mdDialog.show(<IDialogOptions>{
            controller: 'roleGroupEditController',
            controllerAs: 'vm',
            templateUrl: 'tpl/acl/roleGroup/roleGroupEditForm.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {id: roleGroupId}
        }).then((roleGroup: IRoleGroup) => {
            this.roleGroupsList[this.findByProperty(this.roleGroupsList, 'id', roleGroup.id)] = roleGroup;
            this.notificationService.toast('roleGroup has been updated successfully');
        }).catch(err=> this.notificationService.toast(this.translate(err.message)))
    }

    public delRoleGroup(event: MouseEvent, index: number) {
        let roleGroupId = this.roleGroupsList[index].id;
        let confirm = this.$mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('title_delete_confirm')
            .textContent(this.translate('msg_delete_confirm', this.translate('roleGroup')))
            .targetEvent(event)
            .ok(this.translate('yes')).cancel(this.translate('no'));
        this.$mdDialog.show(confirm)
            .then(()=> this.apiService.delete(`acl/roleGroup/${roleGroupId}`))
            .then(()=> {
                this.roleGroupsList.splice(this.findByProperty(this.roleGroupsList, 'id', roleGroupId), 1);
                this.notificationService.toast(this.translate('info_delete_record', this.translate('roleGroup')));
            })
            .catch(err=> this.notificationService.toast(this.translate(err.message)));
    }

    public static registerPermissions() {
        AuthService.registerPermissions('acl.roleGroup', {'acl.roleGroup': ['read']});
    }
}