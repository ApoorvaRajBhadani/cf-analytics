chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    if(request.todo == "appendHTML"){
        let xhr = new XMLHttpRequest();
        xhr.open('GET','src/graph.html',true);
        xhr.onprogress = function(){
            console.log('XHR object on progress');
        }
        xhr.onload = function(){
            console.log('XHR object loaded');
            sendResponse({
                htmlResponse : this.responseText,
            });
        }
        xhr.send();
        return true;
    }
});