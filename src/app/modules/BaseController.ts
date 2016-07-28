import {IPromise} from "angular";
import {NotificationService} from "../service/NotificationService";
import {FormService} from "../service/FormService";
import {AuthService} from "../service/AuthService";
import {ApiService, IFileKeyValue} from "../service/ApiService";
import {LogService} from "../service/LogService";
import {ClientApp} from "../ClientApp";
import {MetaTagsService} from "../service/MetaTagsService";
import {IUpsertResult} from "vesta-schema/ICRUDResult";

export interface IBaseController {
    registerPermissions:()=>void;
}

export abstract class BaseController {
    protected apiService:ApiService = ApiService.getInstance();
    protected authService:AuthService = AuthService.getInstance();
    protected logService:LogService = LogService.getInstance();
    protected formService:FormService = FormService.getInstance();
    protected notificationService:NotificationService = NotificationService.getInstance();
    protected metaTagsService:MetaTagsService = MetaTagsService.getInstance();
    protected Setting = ClientApp.Setting;

    protected getDataTableOptions(title:string, loadMore?:Function) {
        return {
            showFilter: false,
            title: title,
            filter: '',
            order: '',
            rowsPerPage: [10, 20, 50],
            limit: 10,
            page: 1,
            total: 0,
            label: {text: 'Records', of: 'of'},
            loadMore: loadMore
        };
    }

    protected upload<T>(edge:string, images:IFileKeyValue):IPromise<IUpsertResult<T> | void> {
        let notificationService = NotificationService.getInstance();
        return ApiService.getInstance().upload<any, IUpsertResult<T>>(edge, images)
            .then(result=> {
                if (result.error) throw result.error;
                notificationService.toast(`Image has been uploaded successfully`);
                return result;
            })
            .catch(err=> notificationService.toast(err.message));
    }

    public static registerPermissions() {
    }
}