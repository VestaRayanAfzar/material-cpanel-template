export interface IMenuItem {
    title:string;
    isAbstract?:boolean;
    url?:string;
    state?:string;
    children?:Array<IMenuItem>;
}

export const AppMenu:Array<IMenuItem> = [];
AppMenu.push({title: 'Dashboard', state: 'home'});
AppMenu.push({
    title: 'سطح دسترسی',
    state: 'acl',
    isAbstract: true,
    url: 'acl',
    children: [
        {title: 'نقش', state: 'acl.role'},
        {title: 'گروه نقش', state: 'acl.roleGroup'},
        {title: 'کاربر', state: 'acl.user'}]
});