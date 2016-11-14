import {IScope, IDirective, IAugmentedJQuery, IAttributes, INgModelController} from "angular";
import {IClientAppSetting} from "../config/setting";
import {DatePickerService} from "../service/DatePickerService";
import {DateTimeFactory} from "vesta-datetime/DateTimeFactory";
import {IDateTime, DateTime} from "vesta-datetime/DateTime";
import {IDatePickerOptions} from "../service/datePickerService";

export class DateInputController {
    static $inject = ['Setting', 'datePickerService'];

    constructor(private Setting: IClientAppSetting, private datePickerService: DatePickerService) {
    }

    public getLocaleString(): string {
        return this.Setting.locale;
    }

    public show(dpOption: IDatePickerOptions) {
        return this.datePickerService.show(dpOption);
    }
}

export interface IDateInputScope extends IScope {
    ngModel: any;
    vm: DateInputController;
    showPicker: string;
}

export interface IDateInput {
    (): IDirective;
    setDateTime: (dateTime: IDateTime) => void;
    defaultDateTime: IDateTime;
}

/**
 * @ngdoc directive
 * @name dateInput
 * @restrict A
 *
 * @param {boolean} show-picker
 * @param {boolean} is-range
 * @param {number} min-year
 * @param {number} max-year
 */

export function dateInput(): IDirective {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            showPicker: '@'
        },
        controller: DateInputController,
        controllerAs: 'vm',
        bindToController: false,
        link: function (scope: IDateInputScope, $element: IAugmentedJQuery, attrs: IAttributes, ngModel: INgModelController) {
            scope.ngModel = scope.ngModel || NaN;
            var inputDate: DateTime = dateInput['defaultDateTime'] ? new dateInput['defaultDateTime']() : DateTimeFactory.create(scope.vm.getLocaleString());
            ngModel.$parsers.push(value=> {
                var time = inputDate.validate(value);
                if (time) {
                    ngModel.$setValidity('date', true);
                    return time;
                }
                ngModel.$setValidity('date', false);
                ngModel.$setDirty();
                return 0;
            });
            ngModel.$formatters.push(value=> {
                if (!isNaN(value)) {
                    inputDate.setTime(scope.ngModel);
                    return inputDate.format('Y/m/d');
                }
                return '';
            });

            if (scope.showPicker == "true") {
                var dpTrigger = document.createElement('span');
                dpTrigger.classList.add('material-icons');
                dpTrigger.classList.add('dp-trigger');
                dpTrigger.textContent = 'date_range';
                $element[0].parentElement.appendChild(dpTrigger);
                dpTrigger.addEventListener('click', dpHandler, false);
                scope.$on('$destroy', function () {
                    $element[0].removeEventListener('click', dpHandler);
                });
            }
            function dpHandler() {
                var dpOption: IDatePickerOptions = {
                    timestamp: Number(scope.ngModel),
                    clickToSelect: true
                };
                if (attrs['minYear']) dpOption.minYear = attrs['minYear'];
                if (attrs['maxYear']) dpOption.maxYear = attrs['maxYear'];
                scope.vm.show(dpOption)
                    .then(timestamp=> {
                        scope.ngModel = timestamp;
                    })
            }
        }
    };
}

dateInput['setDateTime'] = function (dateTime: IDateTime) {
    dateInput['defaultDateTime'] = dateTime;
};
