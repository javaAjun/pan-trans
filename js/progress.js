var progress = {}
window.onload = function(){

    chrome.extension.onRequest.addListener(function(reqParam, sender, sendResponse) {
        console.log("接收到页面请求",reqParam)
        var key = reqParam.key
        var urls = Object.keys(progress)
        var pro = null
        for(var i=0;i<urls.length;i++){
            var u = urls[i]
            if(u.indexOf(key)!=-1){
                pro = progress[u]
                break
            }
        }
        if(reqParam.type == 'unLogin'){
            pro.status = 3
            sendResponse({code:1})
            var li = document.getElementById(Object.keys(progress)[0])
            li.className = "error"
            li.getElementsByTagName("span")[0].innerText = "执行失败:"+reqParam.msg
            alert("请先登录百度网盘，才能继续使用插件功能")
            return
        }

        if(reqParam.type == 'error'){
            pro.status = 3
            sendResponse({code:1})
            var li = document.getElementById(Object.keys(progress)[0])
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
        startProgress()

        if(pro){
            sendResponse({
                code:1,
                msg:'ok',
                data: {
                    tqm:pro.tqm,
                    path:pro.path
                }
            })
        }else{
            sendResponse({
                code:0,
                msg:'未找到资源:'+key
            })
        }

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
        startProgress()
    })

    function startProgress() {
        for(key in progress){
            var prog = progress[key];
            if(prog.status == 0){
                var li = document.getElementById(key)
                console.log(li)
                li.className = "executing"
                console.log(li.getElementsByTagName("span"))
                li.getElementsByTagName("span")[0].innerText = "执行中"

                chrome.tabs.create({
                    url: prog.url
                }, function(tab){
                    progress[key].tabid = tab.id
                    progress[key].status = 1
                })

                break
            }
        }
    }
}


