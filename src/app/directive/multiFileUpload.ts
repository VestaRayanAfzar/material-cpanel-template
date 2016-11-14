import {IScope, IDirective, IAugmentedJQuery, IAttributes} from "angular";
import {IFileKeyValue} from "../service/ApiService";

export interface IMultiFileUploadScope extends IScope {
}

export class MultiFileUploadController {
    public static $inject = ['$scope', '$element'];
    public fileInput: HTMLInputElement;
    public filesList:IFileKeyValue = {};
    public file: File|Blob|Array<File|Blob>;

    constructor(private $scope: IMultiFileUploadScope, private $element: IAugmentedJQuery) {
        this.fileInput = <HTMLInputElement>this.$element[0].querySelector('input[type=file]');
        let self = this;
        this.fileInput.onchange = function (event) {
            self.filesList[this.files[0].name] = this.files[0];
            $scope.$digest();
        };

    }

    public delete(name){
        delete this.filesList[name]
    }

    public newFile() {
        this.fileInput.click();
    }
}

/**
 * @ngdoc directive
 * @name multiFileUpload
 * @restrict E
 *
 */
export function multiFileUpload(): IDirective {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'tpl/directive/multi-file-upload.html',
        controller: MultiFileUploadController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {
            filesList:'='
        },
        link: function (scope: IMultiFileUploadScope, $element: IAugmentedJQuery, attrs: IAttributes) {
        }
    }
}
