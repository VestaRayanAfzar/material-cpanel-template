import {IScope, IDirective, IAugmentedJQuery} from "angular";
import {IQueryRequest} from "vesta-schema/ICRUDResult";

export interface IPaginationScope extends IScope {
}

export class PaginationController {
    public total: number;
    public itemsPerPageOptions: Array<number>;
    public itemsPerPage: number;
    public page: number = 1;
    public loadMore: (options: IQueryRequest<any>)=> void;
    public maxPage: number;
    public static $inject = ['$scope', '$element'];

    constructor(private $scope: IPaginationScope, private $element: IAugmentedJQuery) {
        this.itemsPerPageOptions = this.itemsPerPageOptions || [10, 20, 30];
        this.itemsPerPage = this.itemsPerPage || 10;
        this.total = this.total || Infinity;
        this.page = this.page || 1;
        this.$scope.$watch('ctrl.itemsPerPage', (newValue: number, oldValue)=> {
            if (newValue && newValue != oldValue) {
                this.loadMore({page: this.page, limit: newValue});
            }
        })
    }

    public getPageList(current) {
        this.maxPage = this.total == Infinity ? 1 : (Math.floor(this.total / this.itemsPerPage) + 1);
        var start = this.getStartPage(current);
        var list = [];
        let total = (start > 1 ? 6 : 5);
        for (let i = start; i < start + total; i++) {
            if (i > this.maxPage) break;
            list.push(i);
        }
        return list;
    }

    private getStartPage(current) {
        let offset = Math.floor(current / 5);
        let start = offset * 5;
        return start ? start : 1;
    }

    public goTo(page) {
        if (page > 0 && page <= this.maxPage) {
            this.page = page;
            this.loadMore({page: this.page})
        }
    }
}

/**
 * @ngdoc directive
 * @name pagination
 * @restrict E
 * @param {number} page
 * @param {number} total
 * @param {number} items-per-page
 * @param {Array<number>} items-per-page-options
 * @param {Function} load-more
 */
export function pagination(): IDirective {
    return {
        restrict: 'E',
        replace: true,
        controller: PaginationController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {
            total: '=',
            itemsPerPageOptions: '=',
            itemsPerPage: '=',
            page: '=',
            loadMore: '=',
        },
        template: `
<div class="pagination">
    <div class="total" flex>
        <label>{{'total_records'|tr}}: </label>
        <span ng-show="ctrl.total == Infinity">{{ctrl.total}}</span>
    </div>
    <div class="item-in-page">
        <label>{{'records_per_page'|tr}}:</label>
        <md-select ng-model="ctrl.itemsPerPage" aria-label="records per page">
            <md-option ng-value="option" ng-repeat="option in ctrl.itemsPerPageOptions">{{option}}
            </md-option>
        </md-select>
    </div>
    <div class="pg-control">
        <md-icon title="First Page" ng-class="{disabled: ctrl.page == 1}"
                 ng-click="ctrl.goTo(1)">last_page
        </md-icon>
        <md-icon title="Prev Page" ng-class="{disabled: ctrl.page == 1}"
                 ng-click="ctrl.goTo(ctrl.page - 1)">chevron_right
        </md-icon>
        <span class="page-selector"
              ng-repeat="page in ctrl.getPageList(ctrl.page)"
              ng-click="ctrl.goTo(page)"
              ng-class="{'active':ctrl.page == page}">{{page}}</span>
        <md-icon title="Next Page" ng-class="{disabled: ctrl.page == ctrl.maxPage}"
                 ng-click="ctrl.goTo(ctrl.page + 1)">chevron_left
        </md-icon>
        <md-icon title="Last Page" ng-class="{disabled: ctrl.page == ctrl.maxPage}"
                 ng-click="ctrl.goTo(ctrl.maxPage)">first_page
        </md-icon>
    </div>
</div>`
    }
}
