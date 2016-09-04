export interface IMenuItem {
    title: string;
    isAbstract?: boolean;
    url?: string;
    state?: string;
    children?: Array<IMenuItem>;
}

export const AppMenu: Array<IMenuItem> = [];
AppMenu.push({title: 'Dashboard', state: 'home'});
AppMenu.push({
    title: 'Access Control',
    state: 'acl',
    isAbstract: true,
    url: 'acl',
    children: [
        {title: 'Role', state: 'acl.role'},
        {title: 'Role Group', state: 'acl.roleGroup'},
        {title: 'User', state: 'acl.user'}]
});
AppMenu.push({title: 'System Log', state: 'log'});