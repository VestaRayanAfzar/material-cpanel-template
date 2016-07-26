import {IScope, IDirective, IAugmentedJQuery, IAttributes} from "angular";
import {IExtRootScopeService} from "../ClientApp";
import {SidenavController} from "./sidenav";

export interface IMenuTriggerScope extends IScope {
}


/**
 * @ngdoc directive
 * @name menuTrigger
 * @restrict E
 *
 */

export function menuTrigger():IDirective {
    return {
        restrict: 'E',
        replace: true,
        template: `<div class="menu-trigger"><span></span><span></span><span></span></div>`,
        scope: {},
        link: function (scope:IMenuTriggerScope, $element:IAugmentedJQuery, attrs:IAttributes) {
            var classList = $element[0].classList;
            $element[0].addEventListener('click', toggle, false);

            var openRemover = scope.$root.$on(SidenavController.Event.Open, ()=> classList.add('opened'));
            var closeRemover = scope.$root.$on(SidenavController.Event.Close, ()=> classList.remove('opened'));

            scope.$on('$destroy', ()=> {
                openRemover();
                closeRemover();
                $element[0].removeEventListener('click', toggle);
            });

            function toggle() {
                // classList.toggle('opened');
                (<IExtRootScopeService>scope.$root).rvm.toggleSidenav();
            }
        }
    }
}
