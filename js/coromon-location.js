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
    $(".responseModal").css("display","none");
    $("#outerError").css("display","none");
    $(".spriteNormal").attr("src","");
    $(".spritePotent").attr("src","");
    $(".spritePerfect").attr("src","");
    $(".idCoromon").text("");
    $(".nameCoromon").text("");
    $(".wikiCoromon a").attr("href","");
    $(".locationList ul")[0].innerHTML = "";

    switch(all){
        case "all":
            $(".inputCoromon").val("");
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
        $(".responseModal").css("display","none");
        $("#outerError").css("display","block");
        $(".errorModal span").text("Error : Coromon not found");
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

function sortEncounterList(encounterList){
    let res = [];

    let elLength = encounterList.length;
    for(let i=0;i<elLength;i++){
        let maxIndex = -1;
        let maxRate = -1;
        for(let j=0;j<encounterList.length;j++){
            let currIndex = j;
            let currRate = -1;
            let currMax = -1;

            let currProbaTotal = encounterList[j].place.list.probaTotal;
            let currEL = encounterList[j].place.list.encounters;
            for(let k=0;k<currEL.length;k++){
                if(currEL[k].rate > currMax){
                    currMax = currEL[k].rate;
                }
            }
            currRate = currMax / currProbaTotal;
            if(currRate > maxRate){
                maxIndex = currIndex;
                maxRate = currRate;
            }
        }

        if(maxIndex >= 0){
            let sp = encounterList.splice(maxIndex,1);
            res[i] = sp[0];
        }
    }
    return res;
}

function setResponseModale(coromonID, encounterList){

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
    console.log(encounterList);
    for(let i=0;i<encounterList.length;i++){
        let townObj = encounterList[i];
        let placeObj = townObj.place;
        let listObj = placeObj.list;
        let encountersObj = listObj.encounters;

        let title = townObj.title;
        let location = placeObj.location;
        let probaTotal = listObj.probaTotal;

        res += "<li class=\"title\">\n";
        res += "<span>"+title+"</span>\n";    //Place
        res += "</li>\n";

        for(let i=0;i<encountersObj.length;i++){
            let rate = encountersObj[i].rate / probaTotal;
            let rateP = Math.floor(rate * 100);
            let position = encountersObj[i].position;

            res += "<li><div class=\"content\">\n";
            res += "<label for=\"idLocation\">ID :</label>\n";
            res += "<span name=\"idLocation\" class=\"idLocation\">"+location+"</span>\n";  //subPlace
            res += "<label for=\"idRate\">Rate :</label>\n";
            res += "<span name=\"idRate\" class=\"idRate\">"+rateP+"%</span><br>\n"; // currProba/probaTotal to be calculate
            res += "<label for=\"idName\">Name :</label>\n";
            res += "<span name=\"idName\" class=\"idName\">"+location+"</span>\n";    // To be modify afterward
            res += "<label class=\"labelPosition\" for=\"idPosition\">Horde :</label>\n";
            res += "<span name=\"idPosition\" class=\"idPosition\">"+position+"</span>\n";
            res += "</div></li>"
        }
    }

    $(res).appendTo(ul);
}