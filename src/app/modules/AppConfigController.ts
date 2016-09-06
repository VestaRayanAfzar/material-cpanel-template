import {AuthService, IAclActions} from "../service/AuthService";
import {BaseController} from "./BaseController";
import {IAppConfig, AppConfig} from "../cmn/models/AppConfig";
import {IQueryRequest, IQueryResult, IUpsertResult} from "vesta-schema/ICRUDResult";
import {Err} from "vesta-util/Err";
import {ValidationError} from "vesta-schema/error/ValidationError";
import IDialogOptions = angular.material.IDialogOptions;
import IDialogService = angular.material.IDialogService;
import IFormController = angular.IFormController;


export class AppConfigController extends BaseController {
    public acl: IAclActions;
    private appConfigForm: IFormController;
    private appConfig: AppConfig;
    public static $inject = ['$mdDialog'];

    constructor(private $mdDialog: IDialogService) {
        super();
        this.metaTagsService.setTitle('AppConfig');
        this.acl = this.authService.getActionsOn('appConfig');

        this.apiService.get<IQueryRequest<IAppConfig>, IQueryResult<IAppConfig>>('config')
            .then(result=> {
                this.appConfig = new AppConfig(result.items[0]);
            })
            .catch(err=> this.notificationService.toast(err.message));
    }

    public updateAppConfig() {
        if (!this.appConfigForm.$dirty) return this.notificationService.toast('Nothing changed');
        let validate = this.formService.evaluate(this.appConfig.validate(), this.appConfigForm);
        if (!validate) return this.notificationService.toast('Invalid form data');
        let appConfig = this.appConfig.getValues<IAppConfig>();
        this.apiService.put<IAppConfig, IUpsertResult<IAppConfig>>('config', appConfig)
            .then(result=> this.appConfig.id = result.items[0].id)
            .then(()=> this.notificationService.toast(`Application configurations has been updated successfully`))
            .catch(err=> {
                this.notificationService.toast(err.message);
                if (err.code == Err.Code.Validation) {
                    this.formService.evaluate((<ValidationError>err).violations, this.appConfigForm);
                }
            });
    }


    public static registerPermissions() {
        AuthService.registerPermissions('appConfig', {'appConfig': ['read']});
    }
}