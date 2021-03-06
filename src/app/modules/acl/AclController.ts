import {AuthService} from "../../service/AuthService";
import {BaseController} from "../BaseController";

export class AclController extends BaseController {
    public static $inject = [];

    static registerPermissions() {
        AuthService.registerPermissions('acl', {'acl.role': ['read'], 'acl.user': ['read'], 'acl.roleGroup': ['read']});
    }
}