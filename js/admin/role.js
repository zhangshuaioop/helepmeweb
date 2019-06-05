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

//加载列表
function findPage(pageNum,search){
    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType:"application/json",
        url: apiUrl+"/sysRole/findPage" ,//url
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
                        `<td >`+data.list[i].name+`</td>`+
                        `<td >`+data.list[i].description+`</td>`+
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

    $("#editAuthority").html(""); //清空编辑页面权限

    $.ajax({
        url : apiUrl+"/sysAuthorith/getList",
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

                    str += `<div class="form-group"><label class="col-sm-2 control-label">`+
                        `<input type="checkbox" name="authorityId" value="`+data[i].id+`"/>`+data[i].name+`</label>`+
                        `<div class="col-sm-10 checkbox" >`;

                    if(data[i].children!=undefined){
                        for(var j=0;j<data[i].children.length;j++){
                            str += ` <label>`+
                                `<input type="checkbox" name="authorityId" value="`+data[i].children[j].id+`"/>`+data[i].children[j].name+
                                `</label>`;
                        }
                    }

                    str += `</div></div>`;
                }


                $("#addAuthority").html(str);

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
    $("#addAuthority").html(""); //清空添加页面权限

    var checkId = checkIds();

    if(checkId.length==1){

        $.ajax({
            url : apiUrl+"/sysRole/edit",
            type : "GET",
            headers: {'Authorization':cookie},
            data: {
                'id':checkId.toString()
            },
            dataType : "json",
            cache : false,
            success : function(result) {

                var sysRole = result.data.sysRole;  //角色

                var sysAuthoritiesTree = result.data.sysAuthoritiesTree; //权限

                if (result.code==200) {
                    $("#id").val(sysRole.id);
                    $("#name_edit").val(sysRole.name);
                    $("#description_edit").val(sysRole.description);
                    if(sysRole.flagEnabled){
                        $("#flagEnabled").prop("checked",true);
                    }else{
                        $("#flagEnabled").prop("checked",false);
                    }

                    var str = ``;

                    for(var i=0;i<sysAuthoritiesTree.length;i++){

                        str += `<div class="form-group"><label class="col-sm-2 control-label">`+
                                `<input type="checkbox" name="authorityId"`;
                                if(sysAuthoritiesTree[i].flagEnabled){
                                    str += `checked="checked"`;
                                }
                                str += `value="`+sysAuthoritiesTree[i].id+`"/>`+sysAuthoritiesTree[i].name+`</label>`+
                                    `<div class="col-sm-10 checkbox" >`;

                        if(sysAuthoritiesTree[i].children!=undefined){
                            for(var j=0;j<sysAuthoritiesTree[i].children.length;j++){
                                str += ` <label>`+
                                    `<input type="checkbox" name="authorityId" `;
                                if(sysAuthoritiesTree[i].children[j].flagEnabled){
                                    str += `checked="checked"`;
                                }
                                str += `value="`+sysAuthoritiesTree[i].children[j].id+`"/>`+sysAuthoritiesTree[i].children[j].name+
                                    `</label>`;
                            }
                        }

                        str += `</div></div>`;
                    }

                    $("#editAuthority").html(str);

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
function authorityIds() {
    var obj = $("[name='authorityId']");
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

    var name = $("#name_add");

    if(name.val()==""){
        name.focus();
        return false;
    }

    //封装数据
    var formObject = {};
    var formArray =$("#save").serializeArray();
    $.each(formArray,function(i,item){
        formObject[item.name] = item.value;
    });

    //权限ids
    formObject["authorityIds"] = authorityIds();

    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType : "application/json; charset=utf-8",
        url: apiUrl+"/sysRole/saveOrUpdate" ,//url
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

    var name = $("#name_edit");

    if(name.val()==""){
        name.focus();
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

    //权限ids
    formObject["authorityIds"] = authorityIds();

    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType : "application/json; charset=utf-8",
        url: apiUrl+"/sysRole/saveOrUpdate" ,//url
        data: JSON.stringify(formObject),
        dataType: "json",
        success: function (result) {
            if (result.code == 200) {

                success();
                $("#edit").modal('hide');

                findPage(pageNum);
            }else {

                erro();

            }

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
                            url : apiUrl+"/sysRole/deletes",
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
    var date = new Date(timestamp);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;

}