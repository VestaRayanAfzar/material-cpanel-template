import {IScope, IDirective, IAugmentedJQuery} from "angular";

interface IThemeItem {
    name: string;
    index: string;
}

export interface IThemeSelectScope extends IScope {
}

export class ThemeSelectController {
    private keyName = 'theme';
    public themes: Array<IThemeItem> = [
        {name: 'green', index: '01'},
        {name: 'blue', index: '02'},
        {name: 'green', index: '03'},
        {name: 'green', index: '04'},
        {name: 'green', index: '05'},
        {name: 'green', index: '06'},
        {name: 'purple', index: '07'}
    ];
    public static $inject = ['$scope', '$element'];

    constructor(private $scope: IThemeSelectScope, private $element: IAugmentedJQuery) {
        let themeName = localStorage.getItem(this.keyName) || 'theme-01';
        document.documentElement.classList.add(themeName);
    }

    public selectTheme(index) {
        let themeName = `theme-${this.themes[index].index}`;
        let classList = document.documentElement.classList;
        for (let i = classList.length; i--;) {
            if (classList[i].indexOf('theme-') == 0) {
                classList.remove(classList[i]);
            }
        }
        classList.add(themeName);
        localStorage.setItem(this.keyName, themeName);
    }
}

/**
 * @ngdoc directive
 * @name themeSelect
 * @restrict E
 *
 * @param {string} selected
 */
export function themeSelect(): IDirective {
    return {
        restrict: 'E',
        replace: true,
        template: `<div class="theme-select"><md-menu>
      <md-button aria-label="Open theme select" class="" ng-click="$mdOpenMenu($event)">
        <md-icon md-menu-origin>select_all</md-icon> {{'theme'|tr}}
      </md-button>
      <md-menu-content class="theme-menu">
        <md-menu-item ng-repeat="theme in ctrl.themes track by $index" ng-click="ctrl.selectTheme($index)" class="theme-item">
          <img ng-src="img/bgs/thumbnail/{{theme.index}}.jpg">
        </md-menu-item>
      </md-menu-content>
    </md-menu></div>`,
        controller: ThemeSelectController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {}
    }
}
