import {IPromise} from "angular";
import {NotificationService} from "../service/NotificationService";
import {FormService} from "../service/FormService";
import {AuthService} from "../service/AuthService";
import {ApiService, IFileKeyValue} from "../service/ApiService";
import {LogService} from "../service/LogService";
import {ClientApp} from "../ClientApp";
import {MetaTagsService} from "../service/MetaTagsService";
import {IUpsertResult} from "vesta-schema/ICRUDResult";
import {TranslateService} from "../service/TranslateService";
import {IDataTableOptions} from "../directive/datatable";

export interface IBaseController {
    registerPermissions: ()=>void;
}

interface ITranslateFn {
    (key: string, ...placeholders: Array<string>): string;
}

export abstract class BaseController {
    protected Setting = ClientApp.Setting;
    protected apiService: ApiService = ApiService.getInstance();
    protected authService: AuthService = AuthService.getInstance();
    protected logService: LogService = LogService.getInstance();
    protected formService: FormService = FormService.getInstance();
    protected notificationService: NotificationService = NotificationService.getInstance();
    protected metaTagsService: MetaTagsService = MetaTagsService.getInstance();
    protected translateService: TranslateService = TranslateService.getInstance();

    protected translate: ITranslateFn = this.translateService.translate.bind(this.translateService);

    protected upload<T>(edge: string, files: IFileKeyValue): IPromise<IUpsertResult<T> | void> {
        let notificationService = NotificationService.getInstance();
        return ApiService.getInstance().upload<any, IUpsertResult<T>>(edge, files)
            .then(result=> {
                if (result.error) throw result.error;
                notificationService.toast(`Files has been uploaded successfully`);
                return result;
            })
            .catch(err=> notificationService.toast(err.message));
    }

    protected getDataTableOptions(options?: IDataTableOptions): IDataTableOptions {
        return angular.merge(<IDataTableOptions>{
            rowNumber: true,
            rowsPerPage: [20, 50, 100],
            limit: 20,
            page: 1,
            total: Infinity,
            pagination: true,
            search: true,
            operations: {}
        }, options);
    }

    protected findByProperty(list: Array<any>, property: string, value: any): number {
        for (let i = list.length; i--;) {
            if (list[i][property] == value) return i;
        }
        return -1;
    }

    public static registerPermissions() {
    }
}