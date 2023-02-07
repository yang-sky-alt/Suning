class Pager{
    constructor( options ){
        // 创建数据 : 
        // 我们有很多的参数需要传入, 我们把参数全部放在对象之中; 
        // 注意 : 我们分页器程序, 我们变成数组操作程序; 
        // - 默认参数的ES6语法 : 
        this.options = {
            // 默认属性 : 
            // 这是dom结构的选择器 
            el : "",
            // 分页总数量 : 
            count : 20,
            // 显示按钮总数 : 
            show_num : 10, 
            // 当前显示的页码;
            index : 0,
            // 参数属性如果有和默认属性相同的属性，那么参数属性的属性会覆盖掉原本的默认属性;，
            callback : function(){},
            ...options 
        }
        // 初始化数据 : 
        // 因为我们传入的参数很多都是需要处理的数据 , 所以我们建立一个init初始化函数来帮助我们创建基础结构; 
        this.init();
        // 注意 : 这里是分页的重难点 , 数组操作 ; 
        // 我们要根据show_num属性截取数组; 
        // 我们要根据当前显示的页码, 进行数组截取; 
        this.slicePageList();
        // 渲染分页解构;
        // - 根据 page_list 数据渲染页面;  
        this.renderPager();
    }
    // 基本结构创建函数 init 
    init(){
        // 1. 把选择符转换成dom对象; 
        let { options } = this;
        let { el , count  } = options;
        options.el = document.querySelector( el );
        // 2. 根据count创建一个渲染结构的数组; 
        // 根据count 数量创建出的数组; 
        let page_list = [];
        for(let i = 1 ; i <= count ; i ++){
            page_list.push( i )
        }   
        // 把page_list 放入到 this之中可以被任意的原型函数访问; 
        this.page_list = page_list;
        // 3. 给dom对象添加事件; 
        // 注意 : 我们添加事件之后一定要改变事件处理函数的this指向; 
        
        if(!options.el.hasEvent){
            options.el.hasEvent = true;
            options.el.addEventListener("click" , this.handlerChangePager.bind(this) )
        }
    }
    renderPager(){
        // 获取dom对象;
        let { el , index , callback } = this.options;
        // 获取数组解构;
        let { render_list } = this;
        // 把数组的结构转换成a标签结构; 
        // 我们给对应下标的按钮上添加 active类名; 
        el.innerHTML = render_list.map(page_no => {
            // 如果当前的页码和显示的页码相同给渲染结构的a标签加上active类名; 
            // 注意 : + 1 是以为我们的索引值是从0开始, page_no 是从1开始
            if( page_no === index + 1 ){
                return `<a href="javascript:void(0)" class="pagination-button active">${ page_no}</a>`
            }else{
                return `<a href="javascript:void(0)" class="pagination-button">${ page_no}</a>`
            }
        }).join("");
        // 无论是什么样的修改行为都会调用 renderpage函数; 
        // 我们在渲染结束之后去调用 callback 回调函数告知外部程序我们的分页器修改了; 
        // 第一次渲染页面不调用callback; 
        callback( index );
    }
    // 截取数组功能 : 
    slicePageList(){
        let { page_list } = this;
        let { index , show_num , count} = this.options; 
        // 我们最终要把截取结果赋值给 this 里面的page_list 因为我们在其他函数之中; 
        // 在renderPage函数之中访问的是this.里面的page_list数据; 
        // 注意 : 截取开头位置就是当前标记的页码位置 , 终止位置是根据 show_num 显示数量计算出来的; 

        // 注意 : 我们之前在操作数组的时候是一直在操作 page_list 里面的数据, 但是这里面的数据会因为我们的多次操作而导致截取过程失效; 
        // 我们解决的方案就是创建一个全新的数组, 用全新的数组接纳page_list的截取结果; 

        // 特殊情况 : 
        // 1. 如果 index + show_num 已经大于数组数量应该怎么办; 
        // - 如果 index + show_num 大于数组的最后一个下标, 我们显示数组的后10个数据; 
        let render_list = [];
        if( index + show_num > page_list.length ){
            render_list = page_list.slice( -show_num )
        }else{
            render_list = page_list.slice( index , index + show_num )
        }
        // 2. 根据我们的省略内容进行省略号的添加; 
        // - 省略号一定是加载数组的开头; 
        if( index > 0 && count > show_num ){
            // 向数组的开头去添加"..."
            render_list = ["1","..." , ...render_list ];
        }
        // - 如果结尾数值显示不出来我们应该添加结尾省略号; 
        if( index + show_num < page_list.length ){
            render_list = [ ...render_list  , "..." , count ];
        }
        // 3. 给分页器添加上一页和下一页按钮; 
        render_list = ["上一页" , ...render_list , "下一页"];
        // 注意 : 我们在后面使用的数组全部都是我们渲染用的数组; 
        this.render_list = render_list;
    }
    // 事件处理功能 : 
    handlerChangePager( e = event ){
        // 获取事件源 : 
        let { target } = e ;
        let { index , count } = this.options;
        // 使用事件委托来实现功能; 
        // 事件处理函数的this指向实例对象; 
        // console.log( this );
        // 1. 判定我们点击的功能是 : 上一页 , 下一页 还是具体的某个按钮; 
        // - 为了防止点击外部容器实现功能我们限定标签类型为a标签 : 
        if( target.nodeName !== "A") return false;

        // 2. 根据点击内容修改 options里面的下标;
        switch( target.innerHTML ){
            case "上一页" : 
            // 赋值的时候一定要通过 this.options 赋值, 否则我们的错误操作 index ++ 只会操作一个变量
            // 我们要给上一页添加一个阈值 
                    if( index > 0 ){
                        this.options.index = --index;
                    }
                    break;
            case "下一页" : 
                    if( index < count - 1 ){
                        this.options.index = ++index ;
                    }
                    break;
            // ... 表示省略符没有特殊功能; 
            case "..." :  break;
            default : 
                // default是所有的数值页码, 但是数值页码是从1开始的, 我们等你的index 是从0开始的所以我们赋值的时候要 -1; 
                this.options.index = target.innerHTML - 1;
                break;
        }

        // 3. 如果想要修改页面 : 
        // - 截取数组  : slicePageList
        // - 根据数组渲染页面 renderPager

        this.slicePageList();
        this.renderPager();
    }
}