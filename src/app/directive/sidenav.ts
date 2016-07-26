import {IScope, IDirective, IAugmentedJQuery, IAttributes} from "angular";
import {IExtRootScopeService} from "../ClientApp";
import {SidenavService} from "../service/SidenavService";
import {IMenuItem} from "../config/app-menu";

export interface ISidenavScope extends IScope {
}

export class SidenavController {
    private static SIDENAV_OPEN_CLASS_NAME = 'sidenav-open';
    public static Event = {Open: 'sidenav.open', Close: 'sidenav.close'};
    private classList:DOMTokenList;
    public componentId:string;
    public menuItems:Array<IMenuItem> = [];
    private bodyClassName:string;
    public static $inject = ['$scope', '$element', '$rootScope', 'sidenavService'];

    constructor(private $scope:ISidenavScope, private $element:IAugmentedJQuery, private $rootScope:IExtRootScopeService,
                private sidenavService:SidenavService) {
        this.classList = $element[0].classList;
        this.bodyClassName = `${this.componentId}-${SidenavController.SIDENAV_OPEN_CLASS_NAME}`;
        sidenavService.add(this);
    }

    public toggle():boolean {
        if (this.isOpen()) return this.close();
        return this.open();
    }

    public close() {
        this.$rootScope.$broadcast(SidenavController.Event.Close);
        this.classList.remove(SidenavController.SIDENAV_OPEN_CLASS_NAME);
        document.body.classList.remove(this.bodyClassName);
        return false;
    }

    public open() {
        this.$rootScope.$broadcast(SidenavController.Event.Open);
        this.classList.add(SidenavController.SIDENAV_OPEN_CLASS_NAME);
        document.body.classList.add(this.bodyClassName);
        return true;
    }

    public isOpen():boolean {
        return this.classList.contains(SidenavController.SIDENAV_OPEN_CLASS_NAME);
    }

    public setMenu(menuItems:Array<IMenuItem>) {
        this.menuItems = menuItems;
    }
}

/**
 * @ngdoc directive
 * @name sidenav
 * @restrict E
 *
 */

export function sidenav():IDirective {
    return {
        restrict: 'E',
        replace: true,
        template: `<div class="sidenav">
    <ul class="main-menu" ng-repeat="item in ctrl.menuItems">
        <li>
            <a ng-if="!item.children" ui-sref="{{item.state}}">{{item.title}}</a>
            <a ng-if="item.children">{{item.title}}</a>
            <ul ng-if="item.children" ng-repeat="children in item.children" class="sub-menu">
                <li>
                    <a ui-sref="{{children.state}}">{{children.title}}</a>
                </li>    
            </ul>
        </li>
    </ul></div>`,
        controller: SidenavController,
        controllerAs: 'ctrl',
        transclude: true,
        bindToController: {
            componentId: '='
        },
        scope: {},
        link: function (scope:ISidenavScope, $element:IAugmentedJQuery, attrs:IAttributes) {
        }
    }
}
