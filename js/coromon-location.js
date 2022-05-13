var COROMONDATA = {
    encounterList : "",
    coromonToBdd : ""
}

$(document).ready(function(){
    $(".reset").click(function(){
        $(".responseModal").css("display","none");
        $(".inputCoromon").val("");
        $(".spriteNormal").attr("src","");
        $(".spritePotent").attr("src","");
        $(".spritePerfect").attr("src","");
        $(".idCoromon").text("");
        $(".nameCoromon").text("");
        $(".wikiCoromon a").attr("href","");
        $(".locationList ul")[0].innerHTML = "";
    });

    $(".submit").click(function(){
        var coromonInput = inputReplace($(".inputCoromon").val());
        var coromonID = getCoromonID(coromonInput);
        alert(coromonID);
    });

    COROMONDATA = {
        encounterList:getEncounterListPromise(),
        coromonToBdd:getCoromonToBdd()
    }
});

function inputReplace(coromonInput){
    return coromonInput.replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function getEncounterListPromise(){
    fetch("./data/EncounterList.json").then(res=>res.json()).then(data => (COROMONDATA.encounterList = data));
}

function getCoromonToBdd(){
    fetch("./data/CoromonToBDD.json").then(res=>res.json()).then(data => (COROMONDATA.coromonToBdd = data));;
}

function getCoromonID(coromonName){
    var coromons = COROMONDATA.coromonToBdd.coromons;
    for(key in coromons){
        if(coromons[key] == coromonName){
            return key;
        }
    }
    return null;
}