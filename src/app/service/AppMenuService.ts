import {IMenuItem} from "../config/app-menu";
import {AuthService} from "./AuthService";

export class AppMenuService {
    private static menuItems:Array<IMenuItem> = [];
    public static $inject = ['authService'];

    constructor(private authService:AuthService) {

    }

    public getMenu(id:string):Array<IMenuItem> {
        var menuItems = AppMenuService.menuItems[id];
        if (!menuItems || !menuItems.length) return [];
        return this.extractMenu(menuItems);
    }

    private extractMenu(items:Array<IMenuItem>) {
        var result:Array<IMenuItem> = [];
        for (var i = 0, il = items.length; i < il; ++i) {
            if (this.authService.hasAccessToState(items[i].state)) {
                if (items[i].children) {
                    var childResult = this.extractMenu(items[i].children);
                    if (childResult.length) {
                        result.push({
                            title: items[i].title,
                            state: items[i].state,
                            children: childResult
                        });
                    }
                } else {
                    result.push(items[i]);
                }
            }
        }
        return result;
    }

    public static setMenuItems(id:string, items:Array<IMenuItem>) {
        AppMenuService.menuItems[id] = items;
    }
}