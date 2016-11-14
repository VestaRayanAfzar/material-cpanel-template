import {IScope, IDirective, IAugmentedJQuery} from "angular";
import {FieldType} from "vesta-schema/Field";
import {Permission} from "../cmn/models/Permission";
import {DateTimeFactory} from "vesta-datetime/DateTimeFactory";
import {DateTime} from "vesta-datetime/DateTime";
import {IQueryRequest} from "vesta-schema/ICRUDResult";
import {ClientApp} from "../ClientApp";
import ICompileService = angular.ICompileService;

export interface IDataTableOperations {
    read?: Function;
    add?: Function;
    edit?: Function;
    del?: Function;
}

export interface IDataTableOptions {
    rowNumber?: boolean;
    pagination?: boolean;
    search?: boolean;
    total?: number;
    limit?: number;
    page?: number;
    rowsPerPage?: Array<number>;
    operations?: IDataTableOperations;
}

export interface IDataTableColumn<T> {
    text: string;
    type: FieldType;
    sortable?: boolean; // default true
    render?: (record: T)=> string;
    options?: any;
}

export interface IDataTableColumns<T> {
    [name: string]: IDataTableColumn<T>;
}

export interface IDataTableScope extends IScope {
}

export class DataTableController<T> {
    private columns: IDataTableColumns<T>;
    private records: Array<T>;
    private options: IDataTableOptions;
    private tBody: HTMLTableSectionElement;
    private dateTime: DateTime;
    private appliedRequest: IQueryRequest<T>;
    public static $inject = ['$scope', '$element', '$compile'];

    constructor(private $scope: IDataTableScope, private $element: IAugmentedJQuery, private $compile: ICompileService) {
        if (this.columns) {
            this.dateTime = DateTimeFactory.create(ClientApp.Setting.locale);
            this.init();
            $scope.$watchCollection(()=> this.records, (newRecords)=> {
                if (newRecords) this.updateRecords();
            })
        }
        this.appliedRequest = {page: 1, limit: this.options.limit};
        // load page is called from paginationController
        this.loadPage = this.loadPage.bind(this);
    }

    private init() {
        let table: HTMLTableElement = document.createElement('table');
        this.$element[0].firstElementChild.appendChild(table);
        table.className = 'data-table';
        let header: HTMLTableSectionElement = document.createElement('thead');
        table.appendChild(header);
        header.appendChild(this.createHeaderRow());
        if (this.options.search) {
            header.appendChild(this.createFilterRow());
        }
        this.tBody = document.createElement('tbody');
        table.appendChild(this.tBody);
        // header click
        header.addEventListener('click', (ev: MouseEvent)=> {
            let srcElm: HTMLElement = <HTMLElement>(ev.srcElement || ev.target);
            if (srcElm.className != 'sortable-column') srcElm = srcElm.parentElement;
            var field = srcElm.getAttribute('data-field');
            if (!field) return;
            let asc = +srcElm.getAttribute('data-asc');
            this.removeSiblingOrderBy(srcElm);
            let orderBy = {field, ascending: true};
            if (!asc) {
                srcElm.setAttribute('data-asc', '1');
            } else if (asc == 1) {
                orderBy.ascending = false;
                srcElm.setAttribute('data-asc', '2');
            } else { // asc == 2
                srcElm.removeAttribute('data-asc');
                orderBy = null;
            }
            let option: IQueryRequest<T> = {
                orderBy: orderBy ? [orderBy] : []
            };
            this.loadPage(option);
        });
        // action columns click
        this.tBody.addEventListener('click', (ev: MouseEvent)=> {
            let srcElm: HTMLElement = <HTMLElement>(ev.srcElement || ev.target);
            if (/*srcElm.nodeName == 'SPAN' && */srcElm.className == 'material-icons') srcElm = srcElm.parentElement;
            if (srcElm.classList.contains('action-edit')) {
                this.options.operations.edit(ev, srcElm.getAttribute('data-index'));
            } else if (srcElm.classList.contains('action-del')) {
                this.options.operations.del(ev, srcElm.getAttribute('data-index'));
            }
        }, false);
    }

    private removeSiblingOrderBy(elm: HTMLElement) {
        // prev
        let ps = elm.previousElementSibling;
        while (ps) {
            ps.removeAttribute('data-asc');
            ps = ps.previousElementSibling;
        }
        // next
        let ns = elm.nextElementSibling;
        while (ns) {
            ns.removeAttribute('data-asc');
            ns = ns.nextElementSibling;
        }
    }

    private createHeaderRow(): HTMLTableRowElement {
        let row: HTMLTableRowElement = document.createElement('tr');
        let cell: HTMLTableHeaderCellElement = document.createElement('th');
        if (this.options.rowNumber) {
            cell.className = 'index-column';
            row.appendChild(cell);
        }
        for (let columns = Object.keys(this.columns), i = 0, il = columns.length; i < il; ++i) {
            let column: IDataTableColumn<T> = this.columns[columns[i]];
            cell = document.createElement('th');
            row.appendChild(cell);
            var hasSortableProp = column.hasOwnProperty('sortable');
            if (!hasSortableProp || (hasSortableProp && column.sortable)) {
                // let wrapper = document.createElement('div');
                // cell.appendChild(wrapper);
                cell.className = 'sortable-column';
                cell.setAttribute('data-field', columns[i]);
            }
            cell.textContent = column.text;
        }
        // add new record icon
        cell = document.createElement('th');
        row.appendChild(cell);
        cell.className = 'action-column';
        let addCallback = this.options.operations && this.options.operations[Permission.Action.Add];
        if (addCallback) {
            let btn: HTMLButtonElement = document.createElement('button');
            cell.appendChild(btn);
            btn.className = 'md-button md-primary md-icon-button';
            let icon: HTMLSpanElement = document.createElement('span');
            icon.className = 'material-icons';
            icon.textContent = 'add';
            btn.appendChild(icon);
            btn.addEventListener('click', event=> {
                addCallback(event);
            });
        }
        return row;
    }

    private createFilterRow(): HTMLTableRowElement {
        // let row: HTMLTableRowElement = document.createElement('tr');
        // row.className = 'filter-row';
        let html = '<tr class="filter-row">';
        if (this.options.rowNumber) {
            // row.appendChild(document.createElement('td'));
            html += `<td></td>`;
        }
        // columns
        for (let columns = Object.keys(this.columns), i = 0, il = columns.length; i < il; i++) {
            var columnName = columns[i];
            let column = this.columns[columnName];
            // let cell: HTMLTableCellElement = document.createElement('td');
            html += '<td><div>';
            // row.appendChild(cell);
            if (column.type == FieldType.Enum) {
                html += `<select name="${columnName}" ng-model="ctrl.filter.${columnName}">`;
                html += `<option value=""></option>`;
                for (let keys = Object.keys(column.options), i = 0, il = keys.length; i < il; i++) {
                    var key = keys[i];
                    if (!isNaN(+key)) continue;
                    let value = column.options[key];
                    html += `<option value="${value}">{{'${key}'|tr}}</option>`;
                }
                html += '</select>';
            } else {
                // let inp: HTMLInputElement = document.createElement('input');
                html += `<input type="text" name="${columnName}" ng-model="ctrl.filter.${columnName}"`;
                // inp.setAttribute('name', columnName);
                switch (column.type) {
                    case FieldType.EMail:
                    case FieldType.URL:
                    case FieldType.Tel:
                    case FieldType.Number:
                    case FieldType.Integer:
                        // inp.setAttribute('dir', 'ltr');
                        html += ' dir="ltr"';
                        // case FieldType.String:
                        break;
                    case FieldType.Timestamp:
                        html += ' dir="ltr"';
                        // inp.setAttribute('placeholder', 'YYYY/MM/DD');
                        // inp.setAttribute('dir', 'ltr');
                        html += ' date-input show-picker="true"';
                        break;
                }
                html += '/>';
            }
            html += '</div></td>';
        }
        // apply
        // let cell: HTMLTableCellElement = document.createElement('td');
        html += `<td class="action-column"><md-button class="md-primary md-icon-button" ng-click="ctrl.loadData(ctrl.filter)"><md-icon>search</md-icon></md-button></td>`;
        // let btn: HTMLButtonElement = document.createElement('button');
        // btn.className = 'md-button md-primary md-icon-button';
        // cell.appendChild(btn);
        // let icon: HTMLSpanElement = document.createElement('span');
        // btn.appendChild(icon);
        // icon.textContent = 'search';
        // icon.className = 'material-icons';
        // btn.addEventListener('click', (event)=> {
        //     this.options.operations.filter(event);
        // });
        html += '</tr>';

        return <HTMLTableRowElement>(this.$compile(html)(this.$scope))[0];
    }

    private updateRecords() {
        this.tBody.innerHTML = '';
        if (!this.records.length) return;
        let columns = Object.keys(this.columns);
        let rowWrapper: DocumentFragment = document.createDocumentFragment();
        let startIndex = (this.options.page - 1) * this.options.limit + 1;
        let showIndex = this.options.rowNumber;
        let hasEdit = this.options.operations.hasOwnProperty(Permission.Action.Edit);
        let hasDelete = this.options.operations.hasOwnProperty(Permission.Action.Delete);
        for (let i = 0, il = this.records.length; i < il; ++i) {
            let record = this.records[i];
            let row: HTMLTableRowElement = document.createElement('tr');
            rowWrapper.appendChild(row);
            if (showIndex) {
                let index = document.createElement('td');
                row.appendChild(index);
                index.textContent = ` ${startIndex + i}`;
            }
            for (let j = 0, jl = columns.length; j < jl; ++j) {
                let fieldName = columns[j];
                let column = this.columns[fieldName];
                row.appendChild(this.renderDataCell(fieldName, column, record));
            }
            let cell: HTMLTableCellElement = document.createElement('td');
            row.appendChild(cell);
            cell.className = 'action-column';
            // action cell
            if (hasEdit) {
                this.createActionBtn(cell, i, true);
            }
            if (hasDelete) {
                this.createActionBtn(cell, i, false);
            }
        }
        this.tBody.appendChild(rowWrapper);
    }

    private createActionBtn(cell: HTMLTableCellElement, index: number, isEdit: boolean) {
        let btn = document.createElement('button');
        cell.appendChild(btn);
        btn.className = `md-button md-icon-button action-${isEdit ? 'edit' : 'del  md-warn'}`;
        btn.setAttribute('data-index', `${index}`);
        let icon = document.createElement('span');
        btn.appendChild(icon);
        icon.className = 'material-icons';
        icon.textContent = isEdit ? 'edit' : 'clear';
    }

    private renderDataCell(fieldName: string, column: IDataTableColumn<T>, record: any): HTMLTableCellElement {
        let cell: HTMLTableCellElement = document.createElement('td');
        if (column.render) {
            cell.innerHTML = column.render(record);
            return cell;
        }
        let cellValue = record[fieldName];
        if (typeof cellValue === 'undefined') {
            cellValue = '';
        } else {
            switch (column.type) {
                case FieldType.EMail:
                case FieldType.URL:
                    cell.style.textAlign = 'left';
                    break;
                case FieldType.Boolean:
                    cell.style.textAlign = 'center';
                    let checked = cellValue ? 'checked' : '';
                    cellValue = `<input type="checkbox" disabled ${checked}/>`;
                    break;
                case FieldType.Enum:
                    break;
                case FieldType.Float:
                    cell.style.textAlign = 'left';
                    cellValue = cellValue.toFixed(3);
                    break;
                case FieldType.Integer:
                    cell.style.textAlign = 'left';
                    cellValue = cellValue.toLocaleString();
                    break;
                case FieldType.Timestamp:
                    if (cellValue) {
                        cell.style.textAlign = 'left';
                        this.dateTime.setTime(cellValue);
                        cellValue = this.dateTime.format('Y/m/d');
                    } else {
                        cellValue = '';
                    }
                    break;
            }
        }
        cell.innerHTML = cellValue;
        return cell;
    }

    public loadPage(option: IQueryRequest<T>) {
        this.appliedRequest = angular.merge({}, this.appliedRequest, option);
        this.options.operations.read(this.appliedRequest);
    }

    public loadData(filter: T) {
        let query: T = <T>{};
        for (let fields = Object.keys(filter), i = fields.length; i--;) {
            let value = filter[fields[i]];
            if (value == null || typeof value == 'undefined') continue;
            if (value !== value) continue;// NaN
            query[fields[i]] = value;
        }
        delete this.appliedRequest.query;
        this.appliedRequest = angular.merge({}, this.appliedRequest, query, {page: 1});
        this.options.operations.read(this.appliedRequest);
    }
}

/**
 * @ngdoc directive
 * @name datatable
 * @restrict E
 *
 * @param {IDataTableOptions} options
 * @param {IDataTableColumns} columns
 * @param {Array<{}>} records
 *
 */
export function datatable(): IDirective {
    return {
        restrict: 'E',
        replace: true,
        controller: DataTableController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {
            options: '=',
            columns: '=',
            records: '='
        },
        template: `<div class="dt-wrapper">
            <div class="data-table"></div>
            <pagination ng-if="ctrl.options.pagination" items-per-page="ctrl.options.limit"
                page="ctrl.options.page"
                total="ctrl.options.total"
                items-per-page="ctrl.options.limit"
                items-per-page-options="ctrl.options.rowsPerPage"
                load-more="ctrl.loadPage"
            </pagination>
        </div>`
    }
}
