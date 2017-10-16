
function validateUrl(url){
    var r = /^(ftp|http|https):\/\/[^ "]+$/;
    return r.test(url);
}
