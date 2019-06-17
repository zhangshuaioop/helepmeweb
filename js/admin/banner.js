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


//文件上传大小设置
var defaults = {
    fileType         : ["jpg","png","bmp","jpeg"],   // 上传文件的类型
    fileSize         : 1024 * 1024 * 10                  // 上传文件的大小 10M
};



/**
 * 加载列表
 * @type {number}
 */
//默认第一页
var pageNum = 1;

//打开页面加载列表
findPage(pageNum);

//加载列表
function findPage(pageNum,search,refresh){
    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType:"application/json",
        url: apiUrl+"/sysBanner/findPage" ,//url

        data:JSON.stringify({
            'search':search,
            'pageNum':pageNum,
            'pageSize':10
        }),
        success: function (result) {
            if (result.code == 200) {

                var data = result.data;

                var str = ``;

                for(var i=0;i<data.list.length;i++){
                    str+=`<tr><td ><input type="checkbox" value="`+data.list[i].id+`" name="checkName" /></td>`+
                        `<td >`+data.list[i].title+`</td>`+
                        `<td >`+
                        `<ul class="docs-pictures clearfix" >`+
                        `<li><img src="`+productName+data.list[i].url+`" alt="`+data.list[i].title+`" style="width:50px; height:50px;"></li>`+
                        `</ul>`+
                        `</td>`+
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

                $("#content").viewer('update');  //图片刷新

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

    //弹出模态框
    $("#add").modal("show");

}







/**
 * 编辑
 */
function edit(){

    var checkId = checkIds();

    if(checkId.length==1){

        $.ajax({
            url : apiUrl+"/sysBanner/get",
            type : "GET",
            headers: {'Authorization':cookie},
            data: {
                'id':checkId.toString()
            },
            dataType : "json",
            cache : false,
            success : function(result) {

                var banner = result.data;

                if (result.code==200) {

                    $("#id").val(banner.id);
                    $("#title_edit").val(banner.title);
                    $("#description_edit").val(banner.description);
                    $("#edit_url").val(banner.url);

                    if(banner.url != null && banner.url.length>0){
                        $("#edit_img_input").attr('src',productName+banner.url);
                    }

                    if(banner.flagEnabled){
                        $("#flagEnabled").prop("checked",true);
                    }else{
                        $("#flagEnabled").prop("checked",false);
                    }

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
 * 保存
 */
function save() {

    var title = $("#title_add");

    if(title.val()==""){
        title.focus();
        return false;
    }

    //封装数据
    var formObject = {};
    var formArray =$("#save").serializeArray();
    $.each(formArray,function(i,item){
        formObject[item.name] = item.value;
    });

    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType : "application/json; charset=utf-8",
        url: apiUrl+"/sysBanner/saveOrUpdate" ,//url
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

    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        headers: {'Authorization':cookie},
        contentType : "application/json; charset=utf-8",
        url: apiUrl+"/sysBanner/saveOrUpdate" ,//url
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
                            url : apiUrl+"/sysBanner/deletes",
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
 * 上传
 * @param file
 */
function upload(file,business){

    var isNo = false;

    var fileList = file.files; //获取的图片文件
    if(fileList.length>0){
        //获取文件上传的后缀名
        var newStr = fileList[0].name.split("").reverse().join("");
        if(newStr.split(".")[0] != null) {
            var type = newStr.split(".")[0].split("").reverse().join("");

            if (defaults.fileType.indexOf(type) > -1) {
                // 类型符合，可以上传

                if (fileList[0].size >= defaults.fileSize) {
                    alert("文件大小过大");
                } else {
                    var formdata=new FormData();
                    formdata.append('urlFile',fileList[0]);

                    $.ajax({
                        headers: {'Authorization':cookie},
                        url: apiUrl+"/sysBanner/upload" ,//url
                        type:'post',
                        contentType:false,
                        data:formdata,
                        processData:false,
                        // async:false,
                        success:function(info){
                            if(info.code==200){
                                isNo=true;
                                if(business=="add"){
                                    $("#add_url").val(info.data);
                                }else {
                                    $("#edit_url").val(info.data);
                                }
                                success();
                            }

                        },
                        error:function(err){
                            erro();
                        }
                    });

                }
            } else {
                erroMy("文件类型错误");
            }
        }else {
            erroMy("没有类型, 无法识别");
        }
    }

    return isNo;
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

        if($("#add").css("display")=="block"){
            $("#saveButton").click();
        }
        if($("#edit").css("display")=="block"){
            $("#editButton").click();
        }
    }
}



/**
 * 自定义错误提示
 * @param o
 */
function erroMy(o){
    $('#erroAlert').text(o);
    $('#erro').modal('show');
    window.setTimeout(function(){
        $('#erro').modal('hide');
    }, 1000);
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