window.onload = function(){
    var url = location.href
    var key
    if(url.indexOf("surl")!=-1){
        key = url.substr(url.lastIndexOf('surl=')+5)
    }else{
        key = url.substr(url.lastIndexOf('/')+1)
    }
    var reqData = {key: key}
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
    chooseDir(path,key)
}

var openDir = function(li){
    var nodes = container.getElementsByClassName("treeview-node")
    for(var i =0; i< nodes.length; i++){
        var node = nodes[i]
        if(node.className.indexOf('treenode-empty') === -1 && node.className.indexOf('treeview-root') === -1){
            console.log('打开',node.innerText)
            node.click()
            setTimeout(()=>{
                openDir(node)
            },1000)
        }
    }
}
// var dialog = document.getElementsByClassName("dialog-body");
// var container = dialog[0].getElementsByClassName("file-tree-container")[0];
// openDir(container)

function chooseDir(path,key){
    setTimeout(()=>{
        var dialog = document.getElementsById("fileTreeDialog");
        if(dialog.length > 2){
            chooseDir()
            return
        }

        var fc = dialog[0].getElementsByClassName("file-tree-container")
        var lis = fc[0].getElementsByTagName("li");
        var choosedDir = null
        for(var i=0;i<lis.length;i++){
            var li = lis[i]
            var dir = li.getElementsByClassName('treeview-txt')[0]
            var dirName = dir.innerText
            path = path?path:"全部文件"
            if(dirName == path){
                choosedDir = dir
                break
            }
        }

        if(choosedDir != null){
            choosedDir.click()
            document.getElementsByClassName('g-button-blue-large')[1].click()

            chrome.extension.sendRequest({type:"finish",key: key}, function(response) {
                window.close()
            })
        }else{
            chrome.extension.sendRequest({type:"error",key: key,msg:"您的网盘里没有 "+path+" 文件夹"}, function(response) {
                window.close()
            })
        }
    },500)
}