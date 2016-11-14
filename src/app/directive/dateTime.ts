import {IScope, IDirective, IAugmentedJQuery, IAttributes} from "angular";
import {PersianDate} from "vesta-datetime-persian";
import ITimeoutService = angular.ITimeoutService;

export interface IDateTimeScope extends IScope {
}

export class DateTimeController {
    public static $inject = ['$scope', '$element'];

    constructor(private $scope: IDateTimeScope, private $element: IAugmentedJQuery) {
        this.update();
        setInterval(()=> this.update(), 60000);
    }

    public update() {
        var pd = new PersianDate();
        pd.setTime(new Date().getTime());
        let date = pd.format('Y/m/d');
        let time = pd.format('H:i');
        this.$element[0].innerHTML = `<span>${date}</span><i></i><span>${time}</span>`;
    }
}

/**
 * @ngdoc directive
 * @name dateTime
 * @restrict E
 *
 */
export function dateTime(): IDirective {
    return {
        restrict: 'E',
        replace: true,
        controller: DateTimeController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {},
        template: '<div class="date-time"></div>'
    }
}
