import {IDirective} from "angular";
import {IState} from "angular-ui-router";
import {IMenuItem} from "../config/app-menu";
import IRootScopeService = angular.IRootScopeService;
import IAngularEvent = angular.IAngularEvent;

interface ISortedItems {
    [state: string]: IMenuItem;
}

export class BreadcrumbController {
    public breadCrumb: Array<IMenuItem> = [];
    private static states: Array<IMenuItem> = [];
    public flatMenu: ISortedItems = {};
    public static $inject = ['$rootScope', '$state'];

    constructor(private $rootScope: IRootScopeService, private $state) {
        this.flatenizeMenu(BreadcrumbController.states);
        $rootScope.$on('$stateChangeSuccess', (event: IAngularEvent, toState: IState)=> {
            let parts = toState.name.split('.');
            this.breadCrumb = [];
            let stateName = '';
            for (let i = 0; i < parts.length; i++) {
                stateName += parts[i];
                let item = this.flatMenu[stateName];
                if (stateName && item && item.state != 'home') {
                    this.breadCrumb.push(item);
                }
                stateName += '.';
            }
        });
    }

    public flatenizeMenu(stateList: Array<IMenuItem>) {
        if (!stateList) return;
        for (let i = 0; i < stateList.length; i++) {
            let stateItem = stateList[i];
            this.flatMenu[stateItem.state] = {
                title: stateItem.title,
                state: stateItem.state,
                icon: stateItem.icon,
                isAbstract: stateItem.isAbstract
            };
            if (stateItem.children && stateItem.children.length) {
                this.flatenizeMenu(stateItem.children)
            }
        }
    }

    public gotoState(state: string) {
        let item = this.flatMenu[state];
        if (!item || item.isAbstract) return;
        this.$state.go(state);
    }

    public static setAppStates(states: Array<IMenuItem>) {
        BreadcrumbController.states = states;
    }
}

/**
 * @ngdoc directive
 * @name breadcrumb
 * @restrict E
 *
 */
export function breadcrumb(): IDirective {
    return {
        restrict: 'E',
        replace: true,
        controller: BreadcrumbController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {},
        template: `<div class="breadcrumb" layout="row" layout-align="center center">
            <md-icon>widgets</md-icon>
            <ul>
                <li ui-sref="home">{{'home'|tr}}</li>
                <li ng-repeat="item in ctrl.breadCrumb"  ng-click="ctrl.gotoState(item.state)">
                    {{item.title|tr}}
                </li>
            </ul>
            <div flex=""></div>
            <span class="icon icon-lg icon-{{ctrl.breadCrumb[ctrl.breadCrumb.length - 1].icon}}"></span>
        </div>`
    }
}
