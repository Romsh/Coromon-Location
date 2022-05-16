var COROMONDATA = {
    encounterList : null,
    coromonToBdd : null
}


$(document).ready(function(){
    (async function(){
        await getEncounterListPromise();
        await getCoromonToBdd();
    })();

    $(".reset").click(function(){
        reset("all");
    });

    $(".submit").click(function(){
        getCoromon();
    });

    $(".inputCoromon").on('keypress', function(e){
        if(e.which == 13){
            getCoromon();
        }
    })
});

function reset(all){

    switch(all){
        case "all":
            $(".responseModal").css("display","none");
            $("#outerError").css("display","none");
            $(".spriteNormal").attr("src","");
            $(".spritePotent").attr("src","");
            $(".spritePerfect").attr("src","");
            $(".idCoromon").text("");
            $(".nameCoromon").text("");
            $(".wikiCoromon a").attr("href","");
            $(".locationList ul")[0].innerHTML = "";
            $(".inputCoromon").val("");
            break;
        case 1: // Coromon not found
            $(".responseModal").css("display","none");
            $("#outerError").css("display","none");
            $(".spriteNormal").attr("src","");
            $(".spritePotent").attr("src","");
            $(".spritePerfect").attr("src","");
            $(".idCoromon").text("");
            $(".nameCoromon").text("");
            $(".wikiCoromon a").attr("href","");
            $(".locationList ul")[0].innerHTML = "";
            $(".responseModal").css("display","none");
            $("#outerError").css("display","block");
            $(".errorModal span").text("Error : Coromon not found");
            break;
        case 2: // Coromon found but can't be encountered in the wild
            $(".locationList").css("display","none");
            $("#outerError").css("display","block");
            $(".errorModal span").text("The Coromon can't be encountered.");
            break;
    }
}

function getCoromon(){
    var coromonInput = inputReplace($(".inputCoromon").val());
    var coromonID = getCoromonID(capitalizeFirstLetter(coromonInput));
    if(coromonID != null){
        $("#outerError").css("display","none");
        $(".responseModal").css("display","block");
        let list = getLocationsByCoromonID(coromonID);
        let sortedList = sortEncounterList(list);
        setResponseModale(coromonID,sortedList);
    }else{
        reset(1);
    }
}

//Function needed to stop js injection attacks
function inputReplace(coromonInput){
    return coromonInput.replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


async function getEncounterListPromise(){
    //return fetch("./data/EncounterList.json").then(res=> res.json());
    fetch("./data/EncounterList.json").then(res=> res.json()).then(json => (COROMONDATA.encounterList =  json));

}

async function getCoromonToBdd(){
    fetch("./data/CoromonToBDD.json").then(res=> res.json()).then(json => (COROMONDATA.coromonToBdd =  json));
}

/* Essayer de prendre en compte les Promises */
function getCoromonID(coromonName){
    let coromons = COROMONDATA.coromonToBdd.coromons;
    for(key in coromons){
        if(coromons[key] == coromonName){
            return key;
        }
    }
    return null;
}

function getCoromonName(coromonID){
    var coromons = COROMONDATA.coromonToBdd.coromons;
    for(key in coromons){
        if(key == coromonID){
            return coromons[key];
        }
    }
    return null;
}

function getLocationsByCoromonID(coromonID){
    var res = [];
    //place is the location
    /*
        Place : Title
        SubPlace : Location (A place can have multiple subplace)
        Rate : currProba/probaTotal to be calculate
        Position
    */
    for(place in COROMONDATA.encounterList){
        let p = COROMONDATA.encounterList[place];

        let placeObj = null;
        placeObj = new Object();
        placeObj.title = place; //Place : Title
        placeObj.subPlaces = [];
        let f = false;

        for(subPlace in p){
            let sb = p[subPlace];
            let sbObj = new Object();
            sbObj.location = null; //SubPlace : Location
            sbObj.encounters = null; // list of encounters (rate,position in battle)

            let en = sb.encounter;
            let maxProba = 0;
            let sbFound = false;

            for(e in en){
                maxProba += en[e][0];  //rate
                let co = en[e][1]; // coromon list
                let list = null;
                let enObj = new Object();
                let enFound = false;

                for(let i=0;i<co.length;i++){
                    pos = i;
                    if(co[i].UID == coromonID){
                        enObj.rate = en[e][0];
                        enObj.position = i+1;
                        enFound = true;
                        sbFound = true;
                        f = true;
                        found = true;
                        list = enObj;
                    }
                }
                if(enFound){
                    sbObj.location = subPlace;
                    sbObj.encounters = list;
                }
            }

            sbObj.maxProba = maxProba;

            if(sbFound && sbObj.encounters != null){
                placeObj.subPlaces.push(sbObj);
            }
        }
        if(placeObj != null && f){
            res.push(placeObj);
        }
    }
    return res;
}

function sortEncounterList(encounterList){
    let resTmp = [];
    let res = [];
    for(place in encounterList){
        let currPlace = encounterList[place];
        let currTmpObj = new Object();
        currTmpObj.title = encounterList[place].title;
        let sortedSubPlace = sortSubPlaces(encounterList[place].subPlaces);
        currTmpObj.subPlaces = sortedSubPlace;
        resTmp.push(currTmpObj);
    }

    res = sortPlaceByFirstSubPlace(resTmp);
    return res;
}

function sortSubPlaces(subPlaces){  //A REFAIRE
    let res = [];

    let cmp = subPlaces.length;
    for(let i=0;i<cmp;i++){
        let indexMax = -1;
        for(let j=0;j<subPlaces.length;j++){
            if(j>0){
                let currSP = subPlaces[j];
                let currRate = currSP.encounters.rate;
                let currMaxProba = currSP.maxProba;
                let maxProba = subPlaces[indexMax].maxProba;
                let maxRate = subPlaces[indexMax].encounters.rate;

                let maxRatio = maxRate/maxProba;
                let currRatio = currRate/currMaxProba;
                if(currRatio > maxRatio){
                    indexMax = j;
                }
            }else{
                indexMax = j;
            }
        }
        let tmp = subPlaces.splice(indexMax,1)[0];
        res.push(tmp);
    }
    return res;
}

function sortPlaceByFirstSubPlace(encounterList){
    let res = [];

    let cmp = encounterList.length;
    for(let i=0;i<cmp;i++){
        let indexMax = -1;
        for(let j=0;j<encounterList.length;j++){
            if(j>0){
                let currEL = encounterList[j];
                let currRate = currEL.subPlaces[0].encounters.rate;
                let currMaxProba = currEL.subPlaces[0].maxProba;
                let maxProba = encounterList[indexMax].subPlaces[0].maxProba;
                let maxRate = encounterList[indexMax].subPlaces[0].encounters.rate;

                let maxRatio = maxRate/maxProba;
                let currRatio = currRate/currMaxProba;
                if(currRatio > maxRatio){
                    indexMax = j;
                }
            }else{
                indexMax = 0;
            }
        }
        res.push(encounterList.splice(indexMax,1)[0])
    }
    return res;
}

function setResponseModale(coromonID, encounterList){ // A REFAIRE

    let coromonName = getCoromonName(coromonID);
    let ul = $(".locationList ul");
    ul.empty();

    //idCard
    $(".coromonNormal img").attr("src","./images/Coromon Sprites/"+coromonName+"_normal.gif");
    $(".coromonPotent img").attr("src","./images/Coromon Sprites/"+coromonName+"_potent.gif");
    $(".coromonPerfect img").attr("src","./images/Coromon Sprites/"+coromonName+"_perfect.gif");
    $(".idCoromon").text(coromonID);
    $(".nameCoromon").text(coromonName);
    $(".wikiCoromon a").attr("href","https://coromon.wiki.gg/wiki/"+coromonName);

    let res = "";

    //location list
    for(let i=0;i<encounterList.length;i++){
        let townObj = encounterList[i]; //places
        let spObj = townObj.subPlaces;  //subplaces
        let title = townObj.title;

        res += "<li class=\"title\">\n";
        res += "<span>"+title+"</span>\n";    //Place
        res += "</li>\n";

        for(let j=0;j<spObj.length;j++){
            let location = spObj[j].location;
            let probaTotal = spObj[j].maxProba;
            let rate = spObj[j].encounters.rate / probaTotal;
            let rateP = Math.floor(rate * 100);
            let position = spObj[j].encounters.position;

            res += "<li><div class=\"content\">\n";
            res += "<label for=\"idLocation\">ID :</label>\n";
            res += "<span name=\"idLocation\" class=\"idLocation\">"+location+"</span>\n";  //subPlace
            res += "<label for=\"idRate\">Rate :</label>\n";
            res += "<span name=\"idRate\" class=\"idRate\">"+rateP+"%</span><br>\n"; // currProba/probaTotal to be calculate
            res += "<label for=\"idName\">Name :</label>\n";
            res += "<span name=\"idName\" class=\"idName\">"+location+"</span>\n";    // To be modify afterward
            res += "<label class=\"labelPosition\" for=\"idPosition\">Horde :</label>\n";
            res += "<span name=\"idPosition\" class=\"idPosition\">"+position+"</span>\n";
            res += "</div></li>";
        }
    }

    $(res).appendTo(ul);
}