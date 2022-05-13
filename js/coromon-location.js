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
        var coromonID = getCoromonID(capitalizeFirstLetter(coromonInput));
        var l = getLocationsByCoromonID(coromonID);
    });

    COROMONDATA = {
        encounterList:getEncounterListPromise(),
        coromonToBdd:getCoromonToBdd()
    }
});

function inputReplace(coromonInput){
    return coromonInput.replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

function getCoromonName(coromonID){

}

function getLocationsByCoromonID(coromonID){
    /*
        Choses à modifier :
            .idCoromon => coromonID
            .nameCoromon =>  getCoromonName(coromonID)
            .wikiCoromon.href => https://coromon.wiki.gg/wiki/getCoromonName(coromonID)

        .title span => Place
        .idLocation => subPlace
        .idRate => currProba/probaTotal
        .idName => description de la zone, à laisser pour le moment, il faut que je fasse un json IDLocation => Description
        .idPosition => 1st, 2nd or 3rd position in an encounter
    */
    var res = [];
    //place is the location
    for(place in COROMONDATA.encounterList){
        let obj = new Object();
        obj.title = place; //.title span here
        obj.place = new Object();
        obj.place.list = new Object();
        obj.place.list.encounters = [];

        let placeFound = false;
        //Object with the list of subplace inside each place. Coromon found on ground or on water
        let p = COROMONDATA.encounterList[place];

        for(subPlace in p){
            //List of each possible encounter inside each subplace
            let enc = p[subPlace].encounter;
            obj.place.location = subPlace; //.idLocation here
            //probability total of encounters.
            let probaTotal = 0;

            //en is the index of the encounter, each row is a single encounter with 1-3 coromons possible
            for(en in enc){
                let currEncounter = enc[en];
                let currProba = currEncounter[0];
                let coromonList = currEncounter[1];
                probaTotal += currProba;

                //coromons list of ONE encounter
                let i = 0;
                for(c in coromonList){
                    i++;
                    let currCoromonID = coromonList[c].UID;
                    if(currCoromonID == coromonID){
                        placeFound = true;
                        let e = {
                            "rate":currProba,
                            "position":i
                        }
                        obj.place.list.encounters.push(e);
                    }
                }
            }
            obj.place.list.probaTotal = probaTotal;
        }

        if(placeFound){
            res.push(obj);
        }
    }
    return res;
}