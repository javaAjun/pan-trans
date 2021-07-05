var progress = {}
var activeTabs = []
var error=false
window.onload = function(){

    chrome.tabs.query({},function(tabs){
        var progressLength = 0
        tabs.forEach(function(tab){
            if(tab.url.indexOf("progress.html")!=-1){
                progressLength++
            }
        });
        if(progressLength>1){
            alert("插件窗口只能打开一个")
            window.close()
        }
    });

    document.getElementById("maxTabLenth").addEventListener("blur", function(){
        var input = document.getElementById("maxTabLenth");
        var value = input.value
        if(!value){
            input.value=1
        }
    });

    chrome.extension.onRequest.addListener(function(reqParam, sender, sendResponse) {
        console.log("接收到页面请求",reqParam)
        var key = reqParam.key
        var urls = Object.keys(progress)
        var pro = null
        for(var i=0;i<urls.length;i++){
            var u = urls[i]
            if(u.indexOf(key)!=-1){
                pro = progress[u]
                key = u
                break
            }
        }

        if(!pro){
            console.log('未找到资源:'+key)
            sendResponse({
                code:0,
                msg:'未找到资源:'+key
            })
            return;
        }
        var oldStatus = pro.status


        if(reqParam.type == 'unLogin'){
            pro.status = 3
            sendResponse({code:1})
            var li = document.getElementById(key)
            li.className = "error"
            li.getElementsByTagName("span")[0].innerText = "执行失败:"+reqParam.msg
            alert("请先登录百度网盘，才能继续使用插件功能")
            error = true
            return
        }

        if(reqParam.type == 'notfound'){
            pro.status = 3
            sendResponse({code:1})
            var li = document.getElementById(key)
            li.className = "error"
            li.getElementsByTagName("span")[0].innerText = "执行失败:"+reqParam.msg
            alert("在您的网盘中未找到文件夹")
            error = true
            return
        }

        if(reqParam.type == 'error'){
            pro.status = 3
            sendResponse({code:1})
            var li = document.getElementById(key)

            li.className = "error"
            li.getElementsByTagName("span")[0].innerText = "执行失败:"+reqParam.msg
        }
        if(reqParam.type == 'finish'){
            pro.status = 2
            sendResponse({code:1})
            var li = document.getElementById(key)
            li.className = "finish"
            li.getElementsByTagName("span")[0].innerText = "执行结束"
        }

        if(reqParam.type!='onload' && !error && oldStatus!=3){
            startProgress(pro.tabid)
        }

        sendResponse({
            code:1,
            msg:'ok',
            data: {
                tqm:pro.tqm,
                path:pro.path
            }
        })

    });

    document.getElementById("trans").addEventListener("click",function(){
        var sourceText = document.getElementById("source").value
        var sources = sourceText.split("\n")
        var savePath = document.getElementById("path").value
        var proHtml = '<ul>'
        sources.forEach((item,i)=>{
            var entry = item.split(" ")
            var url = entry[0]
            var tqm = entry[1]

            var key = url.substr(url.lastIndexOf('/')+1)
            progress[key]={url:url,tqm:tqm,path:savePath,status:0}

            proHtml += "<li class='unExecute' id='"+key+"'>资源路径："+url+" "+"，提取码："+tqm+"，状态：<span class='jd'>等待中</span></li>"
        })

        proHtml+="</ul>"

        document.getElementById("sourcediv").style.display="none";
        document.getElementById("progress").innerHTML = proHtml

        document.getElementById("maxTabLenth").setAttribute("disabled","disabled")
        document.getElementById("path").setAttribute("disabled","disabled")
        var maxTabLenth = document.getElementById("maxTabLenth").value
        for(var i=0;i<maxTabLenth;i++){
            chrome.tabs.create({
                selected:false
            }, function(tab){
                startProgress(tab.id)
            })
        }
    })



    function startProgress(tabid) {
        for(key in progress){
            var prog = progress[key];
            if(prog.status == 0){
                progress[key].status = 1
                var li = document.getElementById(key)
                li.className = "executing"
                console.log(li.getElementsByTagName("span"))
                li.getElementsByTagName("span")[0].innerText = "执行中"


                chrome.tabs.update(tabid, {
                    url: prog.url
                });
                progress[key].tabid= tabid

                // chrome.tabs.get(oldTabId, (tab)=>{
                //     console.log(tab)
                //     tab.url = prog.url
                //     progress[key].tabid = tab.id
                // })
                break
            }
        }
    }
}




