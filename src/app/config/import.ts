import {RootController} from "../modules/RootController";
import {SidenavService} from "../service/SidenavService";
import {DatePickerService} from "../service/DatePickerService";
import {NetworkService} from "../service/NetworkService";
import {NotificationService} from "../service/NotificationService";
import {AppCacheService} from "../service/AppCacheService";
import {StorageService} from "../service/StorageService";
import {FormService} from "../service/FormService";
import {DatabaseService} from "../service/DatabaseService";
import {AuthService} from "../service/AuthService";
import {ApiService} from "../service/ApiService";
import {TranslateService} from "../service/TranslateService";
import {I18nService} from "../service/I18nService";
import {translateFilter} from "../filter/translateFilter";
import {paginationFilter} from "../filter/paginationFilter";
import {dateTimeFilter} from "../filter/dateTimeFilter";
import {animDirection} from "../directive/animDirection";
import {currencyInput} from "../directive/currencyInput";
import {dateInput} from "../directive/dateInput";
import {fileUpload} from "../directive/fileUpload";
import {roundImage} from "../directive/roundImage";
import {viewportSpy} from "../directive/viewportSpy";
import {sidenav} from "../directive/sidenav";
import {menuTrigger} from "../directive/menuTrigger";
import {HomeController} from "../modules/HomeController";
import {LoginController} from "../modules/account/LoginController";
import {LogoutController} from "../modules/account/LogoutController";
import {RoleAddController} from "../modules/acl/role/RoleAddController";
import {RoleEditController} from "../modules/acl/role/RoleEditController";
import {RoleController} from "../modules/acl/role/RoleController";
import {RoleGroupAddController} from "../modules/acl/roleGroup/RoleGroupAddController";
import {RoleGroupEditController} from "../modules/acl/roleGroup/RoleGroupEditController";
import {RoleGroupController} from "../modules/acl/roleGroup/RoleGroupController";
import {AclController} from "../modules/acl/AclController";
import {UserAddController} from "../modules/acl/user/UserAddController";
import {UserEditController} from "../modules/acl/user/UserEditController";
import {UserController} from "../modules/acl/user/UserController";
import {AppMenuService} from "../service/AppMenuService";
import {LogService} from "../service/LogService";
///<vesta:import/>

interface IExporter {
    controller:any;
    service:any;
    filter:any;
    directive:any;
}

export const exporter:IExporter = {
    service: {
        i18nService: I18nService,
        translateService: TranslateService,
        apiService: ApiService,
        authService: AuthService,
        databaseService: DatabaseService,
        formService: FormService,
        storageService: StorageService,
        appCacheService: AppCacheService,
        notificationService: NotificationService,
        networkService: NetworkService,
        datePickerService: DatePickerService,
        sidenavService: SidenavService,
        appMenuService: AppMenuService,
        logService: LogService,
        ///<vesta:ngService/>
    },
    filter: {
        dateTime: dateTimeFilter,
        pagination: paginationFilter,
        tr: translateFilter,
        ///<vesta:ngFilter/>
    },
    directive: {
        animDirection: animDirection,
        currencyInput: currencyInput,
        dateInput: dateInput,
        fileUpload: fileUpload,
        roundImage: roundImage,
        viewportSpy: viewportSpy,
        sidenav: sidenav,
        menuTrigger: menuTrigger,
        ///<vesta:ngDirective/>
    },
    controller: {
        rootController: RootController,
        homeController: HomeController,
        loginController: LoginController,
        logoutController: LogoutController,
        roleAddController: RoleAddController,
        roleEditController: RoleEditController,
        roleController: RoleController,
        roleGroupAddController: RoleGroupAddController,
        roleGroupEditController: RoleGroupEditController,
        roleGroupController: RoleGroupController,
        aclController: AclController,
        userAddController: UserAddController,
        userEditController: UserEditController,
        userController: UserController,
        ///<vesta:ngController/>
    }
};
