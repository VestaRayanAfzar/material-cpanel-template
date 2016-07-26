export interface IMenuItem {
    title:string;
    state:string;
    children?:Array<IMenuItem>;
}

export const AppMenu:Array<IMenuItem> = [];
AppMenu.push({title: 'تگ', state: 'tag'});
AppMenu.push({
    title: 'گروه',
    state: 'group',
    children: [
        {title: 'دسته بندی', state: 'group.category'},
        {title: 'بازار عمودی', state: 'group.verticalMarket'}
    ]
});
AppMenu.push({
        title: 'محتوی',
        state: 'content',
        children: [
            {title: 'مقالات', state: 'content.article'},
            {title: 'اخبارها', state: 'content.news'},
            {title: 'کاربردها', state: 'content.application'},
            {title: 'راهکارها', state: 'content.solution'}]
});
AppMenu.push({title: 'کلاس های مالیاتی', state: 'taxClass'});
AppMenu.push({title: 'وضعیت های انبار', state: 'stockStatus'});
AppMenu.push({title: 'خصیصه ها', state: 'attribute'});
AppMenu.push({title: 'گروه خصیصه ها', state: 'attrGroup'});
AppMenu.push({title: 'برند', state: 'manufacturer'});
AppMenu.push({title: 'ویژگی ها', state: 'feature'});
AppMenu.push({title: 'محصولات', state: 'product'});
AppMenu.push({
        title: 'سطح دسترسی',
        state: 'acl',
        children: [
            {title: 'نقش', state: 'acl.role'},
            {title: 'گروه نقش', state: 'acl.roleGroup'},
            {title: 'کاربر', state: 'acl.user'}]
});