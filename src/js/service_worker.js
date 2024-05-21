chrome.runtime.onMessage.addListener( function(request,sender,sendResponse){
    if(request.todo == "appendHTML"){
        fetch(chrome.runtime.getURL('src/graph.html'))
        .then(response => response.text())
        .then(html => {
            sendResponse({
                htmlResponse : html,
            });
        })
        .catch(error => {
            console.error('Error fetching graph.html:', error);
        });
        return true;
    }
});