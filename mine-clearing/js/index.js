function Mine(tr, td, mineNum) {
    this.tr = tr;       //行数
    this.td = td;       //列数
    this.mineNum = mineNum;     //雷的数量  

    this.squares = [];      //存储所有方块的信息，是二维数组。
    this.tds = [];      //存储所有单元格的Dom
    this.surplusMine = mineNum;     //剩余雷的数量，就是决定下面span标签的数字的    
    this.allRight = false;     //右击标的小红旗是否全是雷，为了知道什么时候会赢

    this.parent = document.querySelector('.gameBox');
}

//生成n个不重复的数字
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td);
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function () { return 0.5 - Math.random() });

    //console.log(square);
    return square.slice(0, this.mineNum);

}


Mine.prototype.init = function () {
    //this.randomNum();

    var rn = this.randomNum();      //雷在格子里的位置
    var n = 0;      //用来找到格子对应的索引
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            // n++;


            //取一个方块在数组里的数据要使用行与列的形式。找方块周围的方块的时候要用坐标的形式去找。
            //行与列的形式跟坐标的形式x,y政好是相反的
            if (rn.indexOf(++n) != -1) {
                //如果这个条件成立，说明现在循环到的索引在雷的数组里找到了，那就表示这个索引对应的是雷
                this.squares[i][j] = { type: 'mine', x: j, y: i };
            } else {
                this.squares[i][j] = { type: 'number', x: j, y: i, value: 0 };
            }
        }


    }



    //console.log(this.squares);
    this.updateNum();
    this.createDom();
    //阻止鼠标右击事件
    this.parent.oncontextmenu = function () {
        return false;
    }
    //剩余雷的数量
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
};


//创建表格
Mine.prototype.createDom = function () {

    var This = this;//防止嵌套，实例对象

    var table = document.createElement('table');

    for (var i = 0; i < this.tr; i++) {            //行
        var domTr = document.createElement('tr');
        this.tds[i] = [];


        for (var j = 0; j < this.td; j++) {            //列
            var domTd = document.createElement('td');

            domTd.pos = [i, j];//把格子的行与列存在格子身上，通过这个值去数组里取得对应的数据
            domTd.onmousedown = function () {
                This.play(event, this);     //This是指的实例对象，this指的是点击的那个td
            };



            this.tds[i][j] = domTd;        //把所有的创建的td添加到数组当中



            // if (this.squares[i][j].type == "mine") {
            //     domTd.className = "mine";
            // }
            // if (this.squares[i][j].type == 'number') {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }


            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }

    this.parent.innerHTML = '';         //避免多次点击创建多个
    this.parent.appendChild(table);
};

Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    var result = [];        //把找到的格子的坐标返回出去（二维数组）

    //通过坐标去循环九宫格
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 ||        //格子超出了走遍的范围
                j < 0 ||        //格子超出了上边的范围
                i > this.td - 1 ||      //格子超出了右边的范围
                j > this.tr - 1 ||      //格子超出了下边的范围
                (i == x && j == y) ||       //当前循环道德格子是自己
                this.squares[j][i].type == 'mine'       //周围的格子是个雷  

            ) {
                continue;
            }
            result.push([j, i]);//要以行与列的形式返回出去，到时候需要用它去取数组里的数据
        }
    }
    return result;

};
//更新所有的数字
Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            //至更新雷周围的数字
            if (this.squares[i][j].type == "number") {
                continue;
            }
            var num = this.getAround(this.squares[i][j]);//获取到雷周围的每一个数字

            // console.log(num);
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
    //console.log(this.squares);
}

Mine.prototype.play = function (ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != 'flag') {     //限制标完红旗后不能点击左键
        // console.log(obj);
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        // console.log(curSquare);
        var cl = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        if (curSquare.type == 'number') {
            //点到了数字
            // console.log('数字');
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];


            //点到了0的时候
            if (curSquare.value == 0) {
                /*
                这是一个递归
                    点到数字时：
                    1.显示自己
                    2.找四周
                        1、显示四周(如果四周不为0，就停止)
                        2、如果值为0
                            1、显示自己
                            2、找四周(如果四周不为0，就停止)
                */


                obj.innerHTML = '';


                function getAllZero(square) {
                    var around = This.getAround(square);        //  找到了周围的n个格子  

                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0];   //行
                        var y = around[i][1];   //列

                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if (This.squares[x][y].value == 0) {
                            //如果以某个格子为中心找到的格子值为0，那就需要接着调用函数(递归)
                            if (!This.tds[x][y].check) {
                                /*给对应的td添加一个属性，这条属性用于决定这个格子有没有被找过。
                                   如果找到过，它的值为true,下一次就不会再找了  */
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                        } else {
                            //以某个格子为中心找到的格子不为0，就原样显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        } else {
            //点到了雷
            // console.log('雷雷雷');
            this.gameOver(obj);
        }
    }

    //点击右键的时候
    if (ev.which == 3) {
        //如果点击一个数字，就不能点击
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';//切换有误的class

        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true;//小红旗后面都是雷，就游戏成功了
        } else {
            this.allRight = false;
        }

        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }

        if (this.surplusMine == 0) {
            //剩余的雷的数量为0，表示标完了小红旗，这时候要判断游戏是否成功
            if (this.allRight) {
                //这个条件成立说明全部标对了
                alert("恭喜你，游戏通过");
            } else {
                alert("游戏失败");
                this.gameOver();
            }
        }
    }
};
//游戏失败
Mine.prototype.gameOver = function (clickTd) {
    /*
        1、显示所有的雷
        2、取消所有的点击事件
        3、给点钟的那个雷添加红色
    */

    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = 'null';
        }
    }
    if (clickTd) {
        // clickTd.style.backgroundColor = "#f00";
        clickTd.style.backgroundCOlor = 'red';//不显示红色是因为图片的原因，不透明(样式是有的)
    }

}


//最上面button的功能
var btns = document.querySelectorAll('.level button');
var mine = null;        //用来存储生成的实例
var ln = 0;             //用来处理当前选中的状态
var arr = [[9, 9, 10], [16, 16, 40], [28, 28, 99]];     //  不同级别的行列雷的数量

for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {
        btns[ln].className = '';
        this.className = "active";

        mine = new Mine(...arr[i]);
        mine.init();

        ln = i;     //  ln并不是i的值，而是btns.length的值  
    }
}
btns[0].onclick();      //初始化一下，直接显示第一个
btns[3].onclick = function () {
    mine.init();
}
// var mine = new Mine(28, 28, 99);
// mine.init();
//console.log(mine.getAround(mine.squares[0][0]));