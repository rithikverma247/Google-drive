

var flag =0;
document.querySelector("#mydrive i")
.addEventListener("click",function(){
    //  alert("heey")
    if(flag === 0){
        document.querySelector("#mydrive i").style.transform = "rotate(90deg)";
        document.querySelector(".folders").style.height = "fit-contant";
        document.querySelector(".folders").style.paddingTop = "1vw";
        document.querySelector(".folders").style.paddingBottom = "1vw";
        document.querySelector(".folder").style.opacity= 1;
        flag = 1;
    }
    else{
        document.querySelector("#mydrive i").style.transform = "rotate(0deg)";
        document.querySelector(".folders").style.height = "0vh";
        document.querySelector(".folders").style.paddingTop = "0vw";
        document.querySelector(".folders").style.paddingBottom = "0vw";
        document.querySelector(".folder").style.opacity= 0;
        flag = 0;
    }


})



// var flag =0;
// document.querySelector(".md")
// .addEventListener("click",function(){
//     //  alert("heey")
//     if(flag === 0){
    
//         document.querySelector(".hvr").style.opacity= 1;
//         document.querySelector(".hvr").style.top= "18%";
//         document.querySelector(".hvr").style.left= "16%";
//         flag = 1;
//     }
//     else{
//         document.querySelector(".hvr").style.opacity= 0;
//         flag = 0;
//     }

// })








// document.querySelector("#cancel")
// .addEventListener("click",function(){
//     document.querySelector(".createfolder").style.scale = 0;
// })

// document.querySelector("#close")
// .addEventListener("click",function(){
//      document.querySelector(".deletef").style.display = "none"
// })

// document.querySelectorAll("#deletePopup")
// .forEach(function(elem){
//      elem.addEventListener("click",function(){
//         document.querySelector(".deletef").style.display = "flex"
//    })
// })

// document.querySelector("#cancel")
// .addEventListener("click",function(){
//      document.querySelector(".deletef").style.display = "none"
// })






