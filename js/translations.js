// Recursive function to iterate over nested JSON data
function changeText(obj,parents){
	var keys = Object.keys(obj);
	for(var i=0; i<keys.length; i++){
	    var key = keys[i];
	    if(typeof obj[key] != "string"){
	    	changeText(obj[key],parents + " [data-translation='"+key+"']");
	    }else{
	    	if(key == "url"){
	    		$(parents + " [data-translation='title']").attr('href',obj[key]);
	    	}else{
	    		$(parents + " [data-translation='"+key+"']").html(obj[key]);
	    	}
	    }
	}
}

// Switch languages.
// Currently supported 'en', 'ml'.
function changeLanguage(lang){
	if(langData == null)
		return;
	var strings = langData[lang];
	changeText(strings,"");
}

// Load translation JSON
function loadTranslations(){
	$.getJSON("Strings.json",function(data){
		langData = data;
		changeLanguage(defaultLang);
	})
}

var langData = null;
var defaultLang = "en";