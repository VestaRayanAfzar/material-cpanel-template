import {IScope, IDirective, IAugmentedJQuery, IAttributes} from "angular";
import {LogLevel} from "../cmn/enum/Log";
import {GregorianDate} from "vesta-datetime-gregorian";
import {ILogger} from "../cmn/interfaces/ILogger";

export interface ILogTableScope extends IScope {
}

export class LogTableController {
    private logs: Array<ILogger>;
    public filter: ILogger = <ILogger>{};
    public static $inject = ['$scope', '$element'];

    constructor(private $scope: ILogTableScope, private $element: IAugmentedJQuery) {
        let remover = $scope.$watchCollection(()=> this.logs, (newValue, oldValue)=> {
            if (newValue && newValue.length) this.parseLogs();
        });
        $scope.$on('$destroy', ()=> remover());
    }

    private parseLogs() {
        let html = '<table><tr><td>LogLevel</td><td>Date</td><td>Duration</td><td>Data</td></tr>';
        let date = new GregorianDate();
        for (let i = 0, il = this.logs.length; i < il; ++i) {
            let log = this.logs[i];
            date.setTime(log.start);
            html += `<tr>
                <td>${this.getLogLevelName(+log.level)}</td>
                <td>${date.format('Y/m/d H:i:s')}</td>
                <td>${log.duration}ms</td>
                <td>${this.renderContent(log.data)}</td>
            </tr>`;
        }
        html += '</table>';
        this.$element[0].querySelector('.logs-wrapper').innerHTML = html;
    }

    public applyFilter() {
        this['fetchLogs']({filter: this.filter});
    }

    private getLogLevelName(level: number) {
        switch (level) {
            case LogLevel.Error:
                return 'Error';
            case LogLevel.Warn:
                return 'Warning';
            case LogLevel.Info:
                return 'Info';
            case LogLevel.Debug:
                return 'Debug';
        }
        return `Unknown (${level})`;
    }

    private renderContent(data) {
        let html = '';
        for (let i = 0, il = data.length; i < il; ++i) {
            switch (+data[i].type) {
                case LogLevel.Error:
                    html += this.renderError(data[i].data);
                    break;
                case LogLevel.Warn:
                    html += this.renderWarning(data[i].data);
                    break;
                case LogLevel.Info:
                    html += this.renderInfo(data[i].data);
                    break;
                case LogLevel.Debug:
                    html += this.renderDebug(data[i].data);
                    break;
                default:
                    console.log(data, i);
            }
        }
        return html;
    }

    private renderError(data) {
        let html = '<div class="log-error"><h3>Error</h3>';
        if (data.error) {
            data = data.error;
        }
        if (data.message) {
            html += `${data.message}`;
            if (data.stack) html += `<br/>${JSON.stringify(data.stack)}`;
        } else {
            html += `${data}<br/>`;
        }
        html += '</div>';
        return html;
    }

    private renderWarning(data) {
    }

    private renderInfo(data) {
        let html = '<div class="log-info"><h3>Information</h3>';
        if (data.ip) {
            html += `W(${data.worker}): Request from ${data.ip} for ${data.url}<br/>`;
        } else {
            html += `${data}<br/>`;
        }
        html += '</div>';
        return html;
    }

    private renderDebug(data) {
        let html = '<div class="log-debug"><h3>Debug</h3>';
        if (data.memUsage) {
            let duration = (data.duration[0] * 1e9 + data.duration[1] / 1e6);
            html += `${data.name}<br/>${duration}ms<br/>`;
        } else {
            html += `${data}<br/>`;
        }
        html += '</div>';
        return html;
    }
}

/**
 * @ngdoc directive
 * @name logTable
 * @restrict E
 *
 * @param {Array<ILogger>} logs
 * @param {Function} fetch-logs
 *
 */
export function logTable(): IDirective {
    return {
        restrict: 'E',
        replace: true,
        template: `<div class="log-table">
        <form ng-submit="ctrl.applyFilter()"><md-input-container>
            <label for="logType">Log Type</label>
            <md-select name="gender" ng-model="ctrl.filter.level" id="logType">
                <md-option ng-value="0">None</md-option>
                <md-option ng-value="1">Error</md-option>
                <md-option ng-value="2">Warning</md-option>
                <md-option ng-value="3">Information</md-option>
                <md-option ng-value="4">Debug</md-option>
            </md-select>
        </md-input-container>
        <md-button class="md-primary" type="submit">Apply Filter</md-button>
        </form>
        <div class="en logs-wrapper"></div>
        </div>`,
        controller: LogTableController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {
            logs: '=',
            fetchLogs: '&'
        },
        link: function (scope: ILogTableScope, $element: IAugmentedJQuery, attrs: IAttributes) {
        }
    }
}
