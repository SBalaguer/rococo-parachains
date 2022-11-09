//very simple scraper to run directly on the browser
// ideally this would be part of the process

let paras = [];
for(const paraTr of $('table > tbody').children) {
    let para = {};
    para.id = paraTr.children[0].children[0].innerText.replace(",","");
    if(paraTr.children[1].children.length === 0){
            para.name = "";
    }
    else if(paraTr.children[1].children[0].children.length < 2) {
        para.name = paraTr.children[1].children[0].innerText; 
    } else {
        para.name = paraTr.children[1].children[0].children[1].innerText;
    }
    paras.push(para);
}

console.log(paras);
