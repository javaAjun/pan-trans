window.onload = function(){


    var url = location.href
    if(url.indexOf("#")!=-1){
        url = url.substr(0,url.indexOf("#"))
    }
    var key
    if(url.indexOf("surl")!=-1){
        key = url.substr(url.lastIndexOf('surl=')+5)
    }else{
        key = url.substr(url.lastIndexOf('/')+1)
    }
    var reqData = {key: key,type:'onload'}
    var loginBtn = document.querySelector("a[node-type=header-login-btn]");
    if(loginBtn){
        reqData.type = 'unLogin'
        reqData.msg = '尚未登录百度网盘'
    }
    console.log(reqData)
    chrome.extension.sendRequest(reqData, function(response) {
        console.log("收到插件响应",response)
        if(response && response.code == 1){
            var saveBtn = document.getElementsByClassName('tools-share-save-hb');
            if(saveBtn.length !== 0){
                save(response.data.path,key)
            }

            var submitBtn = document.getElementsByClassName('submit-a');
            if(submitBtn.length !== 0){
                tqwj(response.data.tqm,key)
            }

        }
    })
}
// chrome.extension.onRequest.addListener(function(reqParam, sender, sendResponse) {
//     tqwj()
//     sendResponse({
//         code:'1',
//         msg:'ok'
//     })
// });

function tqwj(tqm,key){
    document.getElementById("accessCode").value = tqm
    document.getElementsByClassName('submit-a')[0].click()
    setTimeout(function () {
        var msg = document.getElementById("xyLjYl").innerText
        console.log(msg)
        if(msg == "提取码错误"){
            chrome.extension.sendRequest({type:"error",key: key,msg:"提取码错误"}, function(response) {
                window.close()
            })
        }
    },1000)
}


function save(path,key){
    var saveBtn = document.getElementsByClassName('tools-share-save-hb');
    saveBtn[0].click()
    var qxbtn = document.getElementsByClassName('Qxyfvg')
    if(qxbtn && qxbtn.length){
        qxbtn[0].click()
    }
    getPath(path,key)
}

var getPath = function (path,key){
    var dialog = document.getElementById("fileTreeDialog");
    if(!dialog){
        console.log('弹窗正在加载，0.5秒后重试')
        setTimeout(function(){
            getPath(path,key)
        },500)
        return
    }

    var fc = dialog.getElementsByClassName("file-tree-container")
    var lis = fc[0].getElementsByTagName("li");
    openDir(lis[0],true,path,key)
}

var openTask = 0
var openDir = function(li,addTask,path,key){
    if(addTask){
        openTask++
    }
    var node = li.getElementsByClassName("treeview-node")[0]
    if(node.getElementsByClassName('treeview-leaf-loading').length){
        console.log('节点正在加载，0.5秒后重试')
        setTimeout(function(){
            openDir(li,false,path,key)
        },500)
        return
    }
    var lis = li.getElementsByTagName('ul')[0].getElementsByTagName('li')
    console.log('节点加载完毕',lis)
    for(var i=0;i<lis.length;i++){
        var cli = lis[i]
        var cnode = cli.getElementsByClassName("treeview-node")[0]
        if(cnode.className.indexOf("treenode-empty")==-1){
            cnode.click()
            openDir(cli,true,path,key)
        }
    }
    openTask--
    setTimeout(function (){
        if(openTask==0){
            chooseDir(path,key)
        }
    },500)
}
var chooseRetry = 0
var chooseLock = false
function chooseDir(path,key){
    var dialog = document.getElementById("fileTreeDialog");
    var fc = dialog.getElementsByClassName("file-tree-container")
    var lis = fc[0].getElementsByTagName("li");

    var choosedDir = null
    for(var i=0;i<lis.length;i++){
        var li = lis[i]
        var dir = li.getElementsByClassName('treeview-txt')[0]
        var dirName = dir.innerText
        path = path?path:"全部文件"
        console.log(path)
        if(dirName == path){
            choosedDir = dir
            break
        }
    }
    console.log(choosedDir)

    if(choosedDir != null){
        choosedDir.click()
        var submitBtn = document.getElementsByClassName('g-button-blue-large');
        for(var i=0; i<submitBtn.length; i++){
            var btn = submitBtn[i]
            var nodeType = btn.getAttribute("node-type");
            if(nodeType && nodeType == 'confirm'){
                submitBtn = btn
                break
            }
        }

        if(!chooseLock){
            chooseLock = true
            submitBtn.click()
            saveCallback(key)
        }
    }else{
        if(chooseRetry>10){
            chrome.extension.sendRequest({type:"notfound",key: key,msg:"未找到 "+path+" 文件夹"}, function(response) {

            })
        }else{
            chooseRetry++
            setTimeout(function () {
                chooseDir(path,key)
            },500)
        }

    }
}

var retryNum=0
var saveLock = false
function saveCallback(key){
    retryNum++
    var isSuccess = false
    var titles = document.getElementsByClassName('info-section-title');
    if(titles){
        for(var i=0;i<titles.length;i++){
            var title = titles[i]
            console.log('-------title------',title)
            if(title.innerText=='保存成功'){
                isSuccess = true
            }
        }
    }
    if(isSuccess){
        if(!saveLock){
            saveLock = true
            chrome.extension.sendRequest({type:"finish",key: key}, function(response) {

            })
        }
    }else{
        if(retryNum<8){
            setTimeout(function (){
                saveCallback(key)
            },500)
        }else{
            if(!saveLock){
                saveLock = true
                chrome.extension.sendRequest({type:"error",key: key,msg:"保存失败"}, function(response) {

                })
            }
        }
    }
}