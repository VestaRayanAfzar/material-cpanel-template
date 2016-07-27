import {IExtRootScopeService} from "../ClientApp";
import {SidenavService} from "../service/SidenavService";
import {IStateService} from "angular-ui-router";
import {AuthService} from "../service/AuthService";
import {BaseController} from "./BaseController";
import {AppMenuService} from "../service/AppMenuService";
import {IMenuItem} from "../config/app-menu";

export class RootController extends BaseController {
    private sideNavName = 'main-sidenav';
    public headerMenuItems:Array<IMenuItem> = [];
    public static $inject = ['$rootScope', '$state', 'sidenavService', 'appMenuService'];

    constructor(private $rootScope:IExtRootScopeService, private $state:IStateService, private sidenavService:SidenavService, private appMenuService:AppMenuService) {
        super();
        $rootScope.rvm = this;
        this.setAppMenues();
        var loginRemover = $rootScope.$on(AuthService.Events.Login, ()=> this.setAppMenues());
        var logoutRemover = $rootScope.$on(AuthService.Events.Logout, ()=> this.setAppMenues());
        var stateRemover = this.$rootScope.$on('$stateChangeStart', e=> this.sidenavService.get(this.sideNavName).close());
        $rootScope.$on('$destroy', ()=> {
            loginRemover();
            logoutRemover();
            stateRemover();
        });
    }

    public toggleSidenav() {
        if (this.authService.isLoggedIn()) {
            this.sidenavService.get(this.sideNavName).toggle();
        }
    }

    private setAppMenues() {
        this.headerMenuItems = this.authService.isLoggedIn() ? [
            {title: 'Exit', state: 'logout'},
        ] : [
            {title: 'Login', state: 'login'}
        ];
        this.appMenuService.getMenu('main-menu').then(menu=> {
            this.sidenavService.setMenu('main-sidenav', menu.items);
        });
    }
}