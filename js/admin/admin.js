/**
 * 获取cookie验证是否失效
 */
var cookie = getCookie("token");
if(cookie==null){
    window.location.href="../../login.html";
}

function getCookie(name)//取cookies函数
{
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) return unescape(arr[2]); return null;

}





/**
 * 加载列表
 * @type {number}
 */
//默认第一页
var pageNum = 1;

//打开页面加载列表
findPage(pageNum);

var search="";
//加载列表
function findPage(pageNum,search){
    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType:"application/json",
        url: apiUrl+"/sysAdmin/findPage" ,//url
        data:JSON.stringify({
            'search':search,
            'pageNum':pageNum,
            'pageSize':10
        }),
        success: function (result) {
            console.log(result);//打印服务端返回的数据(调试用)
            if (result.code == 200) {


                var data = result.data;

                var str = ``;

                for(var i=0;i<data.list.length;i++){
                    str+=`<tr><td ><input type="checkbox" value="`+data.list[i].id+`" name="checkName" /></td>`+
                        `<td >`+data.list[i].username+`</td>`+
                        `<td >`+data.list[i].nickName+`</td>`+
                        `<td >`+data.list[i].dept+`</td>`+
                        `<td >`+data.list[i].mobile+`</td>`+
                        `<td >`;
                        if(data.list[i].flagEnabled){
                            str+=`<button class="btn btn-info btn-sm">启用</button>`;
                        }else{
                            str+=`<button class="btn btn-danger btn-sm">禁用</button>`;
                        }
                    str+=`</td>`+
                        `<td >`+getLocalTime(data.list[i].createDate)+`</td>`+
                        `</tr>`;

                }

                $("#content").html(str);


                var options = {
                    currentPage: data.pageNum, //当前页
                    totalPages: data.pages, //总页数
                    numberOfPages: 5, //设置控件显示的页码数
                    bootstrapMajorVersion: 3,//如果是bootstrap3版本需要加此标识，并且设置包含分页内容的DOM元素为UL,如果是bootstrap2版本，则DOM包含元素是DIV
                    useBootstrapTooltip: false,//是否显示tip提示框
                    itemTexts:function(type,page, current){//文字翻译
                        switch (type) {
                            case "first":
                                return "首页";
                            case "prev":
                                return "上一页";
                            case "next":
                                return "下一页";
                            case "last":
                                return "尾页";
                            case "page":
                                return page;
                        }
                    },
                    onPageClicked: function (event, originalEvent, type, page) {
                        //给每个页眉绑定一个事件，其实就是ajax请求
                        console.log(event);
                        console.log(originalEvent);
                        console.log(type);
                        console.log(page);
                        findPage(page,search);
                    }
                }
                $('.pagination').bootstrapPaginator(options);

            }else{

                $('#erro').modal('show');

                window.setTimeout(function(){
                    $('#erro').modal('hide');
                }, 1000);


            }
        },
        error : function() {
            $('#exception').modal('show');

            window.setTimeout(function(){
                $('#exception').modal('hide');
            }, 1000);
        }
    });
}




/**
 * 添加
 */
function add() {

    $("#editRole").html(""); //清空编辑页面角色

    $.ajax({
        url : apiUrl+"/sysRole/getList",
        type : "GET",
        headers: {'Authorization':cookie},
        dataType : "json",
        cache : false,
        success : function(result) {

            var data = result.data;

            if (result.code==200) {

                var data = result.data;

                var str = ``;

                for(var i=0;i<data.length;i++){
                    str += `<label>`+
                        `<input type="checkbox" name="roleId" value="`+data[i].id+`"/>`+data[i].name+
                        `</label>`;
                }

                $("#addRole").html(str);

                //弹出模态框
                $("#add").modal("show");
            }else{
                erro();
            }

        },
        error : function() {

            exception();

        }
    });

    //弹出模态框
    $("#add").modal("show");

}


/**
 * 编辑
 */
function edit(){
    $("#addRole").html(""); //清空添加页面角色

    var checkId = checkIds();

    if(checkId.length==1){

        $.ajax({
            url : apiUrl+"/sysAdmin/edit",
            type : "GET",
            headers: {'Authorization':cookie},
            data: {
                'id':checkId.toString()
            },
            dataType : "json",
            cache : false,
            success : function(result) {

                var sysAdmin = result.data.sysAdmin;  //角色
                var sysRoles = result.data.sysRoles; //权限

                if (result.code==200) {

                    $("#id").val(sysAdmin.id);
                    $("#username_edit").val(sysAdmin.username);
                    $("#nick_name_edit").val(sysAdmin.nickName);
                    $("#dept_edit").val(sysAdmin.dept);
                    $("#mobile_edit").val(sysAdmin.mobile);
                    $("#description_edit").val(sysAdmin.description);
                    $("#email_edit").val(sysAdmin.email);
                    if(sysAdmin.flagEnabled){
                        $("#flagEnabled").prop("checked",true);
                    }else{
                        $("#flagEnabled").prop("checked",false);
                    }

                    var str = ``;
                    for(var i=0;i<sysRoles.length;i++){
                        str += `<label>`+
                            `<input type="checkbox" name="roleId"`;
                        if(sysRoles[i].flagSelect){
                            str += `checked="checked"`;
                        }
                        str += ` value="`+sysRoles[i].id+`"/>`+sysRoles[i].name+
                            `</label>`;
                    }

                    $("#editRole").html(str);

                    //弹出模态框
                    $("#edit").modal("show");
                }else{
                    erro();
                }

            },
            error : function() {

                exception();

            }
        });

    }else {
        selectErro();
    }


}


/**
 * 获取所有选中权限id
 * @returns {string}
 */
function roleIds() {
    var obj = $("[name='roleId']");
    var check_val = [];
    for(k in obj){
        if(obj[k].checked)
            check_val.push(obj[k].value);
    }
    return check_val;//获取所有选中的value值
}


/**
 * 保存
 */
function save() {

    var username = $("#username_add");

    if(username.val()==""){
        username.focus();
        return false;
    }

    //封装数据
    var formObject = {};
    var formArray =$("#save").serializeArray();
    $.each(formArray,function(i,item){
        formObject[item.name] = item.value;
    });

    //角色ids
    formObject["roleIds"] = roleIds();

    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType : "application/json; charset=utf-8",
        url: apiUrl+"/sysAdmin/saveOrUpdate" ,//url
        data: JSON.stringify(formObject),
        dataType: "json",
        success: function (result) {
            console.log(result);//打印服务端返回的数据(调试用)
            if (result.code == 200) {

                success();
                $("#add").modal('hide');

                findPage(pageNum);
            }else {

                erro();

            }

            //重置表单
            document.getElementById("save").reset();
        },
        error : function() {

            exception();

        }
    });
}





/**
 * 更新
 */
function update() {

    var username = $("#username_edit");

    if(username.val()==""){
        username.focus();
        return false;
    }

    //封装数据
    var formObject = {};
    var formArray =$("#update").serializeArray();
    $.each(formArray,function(i,item){
        formObject[item.name] = item.value;
    });

    if(formObject["flagEnabled"] == undefined){
        formObject["flagEnabled"] = false;
    }

    //角色ids
    formObject["roleIds"] = roleIds();

    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType : "application/json; charset=utf-8",
        url: apiUrl+"/sysAdmin/saveOrUpdate" ,//url
        data: JSON.stringify(formObject),
        dataType: "json",
        success: function (result) {
            console.log(result);//打印服务端返回的数据(调试用)
            if (result.code == 200) {

                success();
                $("#edit").modal('hide');

                findPage(pageNum);
            }else {

                erro();

            }

            //重置表单
            document.getElementById("update").reset();
        },
        error : function() {

            exception();

        }
    });
}




/**
 * 删除
 */
function deletes(){

    var checkId = checkIds();

    if(checkId.length>0){

        //执行删除
        bootbox.dialog({
            message : "您确认要删除选中的数据？",
            title : "操作提示",
            onEscape:true,
            buttons : {
                Cancel : {
                    label : "取 消",
                    className : "btn-default"
                },
                OK : {
                    label : "确 定",
                    className : "btn-primary",
                    callback : function() {
                        $.ajax({
                            url : apiUrl+"/sysAdmin/deletes",
                            type : "GET",
                            headers: {'Authorization':cookie},
                            data: {
                                'ids':checkId.toString()
                            },
                            dataType : "json",
                            cache : false,
                            success : function(result) {

                                if (result.code==200) {
                                    success();
                                    findPage(pageNum);
                                }else{
                                    erro();
                                }
                            },
                            error : function() {

                                exception();

                            }
                        });
                    }
                }
            }
        });

    }else {
        selectErro();
    }

}





/**
 * 获取所有选中
 * @returns {string}
 */
function checkIds() {
    var obj = $("[name='checkName']");
    var check_val = [];
    for(k in obj){
        if(obj[k].checked)
            check_val.push(obj[k].value);
    }
    return check_val;//获取所有选中的value值
}


/**
 * 回车键提交
 * @param e
 */
document.onkeydown = function (e) {
    var theEvent = window.event || e;
    var code = theEvent.keyCode || theEvent.which;
    if (code == 13) {
        $("#saveButton").click();
        $("#editButton").click();
    }
}




/**
 * 错误提示
 */
function erro(){
    $('#erro').modal('show');
    window.setTimeout(function(){
        $('#erro').modal('hide');
    }, 1000);
}

/**
 * 成功提示
 */
function success(){
    $('#success').modal('show');
    window.setTimeout(function(){
        $('#success').modal('hide');
    }, 1000);
}

/**
 * 异常提示
 */
function exception(){
    $('#exception').modal('show');
    window.setTimeout(function(){
        $('#exception').modal('hide');
    }, 1000);
}


/**
 * 选择错误提示
 */
function selectErro(){
    $('#selectErro').modal('show');
    window.setTimeout(function(){
        $('#selectErro').modal('hide');
    }, 1000);
}



/**
 * 时间戳转日期
 * @param timestamp
 * @returns {string}
 */
function getLocalTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y+M+D+h+m+s;
}