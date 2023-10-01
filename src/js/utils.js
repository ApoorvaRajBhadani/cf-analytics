function timeToDate(time){
    var date = new Date(time * 1000);
    var ret = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    
    return ret;
}

function dateToTime(date){ 
    var newDate = new Date(date);
    return newDate.getTime() / 1000;
}