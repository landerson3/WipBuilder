/**
	TO DO
		TO DO
			TO DO
				TO DO
					TO DO
Bed Clone Automation
	Get bed clones from galaxy based on angle and color (may need user prompt in addition to product attribute from GX)
		- White upholstery vs. non-white upholstery
	Place only FPO imagery - 3 FPOs per files=
Plant Clone Automation
	Get plants from GE provided field
	Need to make GE provided field
Mirror Antiquing Auotmation 
	Need to do discovery with Miguel
P-Trap Library
	Add P-Trap dropdowns into Globaleldit
	Automate P-Trap input

Save PDFs as E-Number to server for scanning. Brad wrote and delivered bash command
					/Volumes/PersonalShares/Luke Anderson/rename-EID
					

Garbage collect processed files and outlines after the WIP is made

++ add a "preferences menu"
	-- Preferences:
		-- Handler for missing JPGs (run and log vs. stop vs. query each)
		-- Handler for incorrect status' (run and log vs. stop vs. query each)
		-- 
++ Post WIPs to Sever


**/






/**
* @@@BUILDINFO@@@ WIP Builder.jsx !Version! Mon Jul 27 2020 11:35:00 GMT-0800
*/


// This version is in line with the original web action
// Functionality to download and include REFs

//////////////////////////////////////* UPDATE LOG HERE*/////////////////////////
/////////////////////* Update log will be in descending order with the most recent updates first	*/////////////////////


/* July 27th, 2020
Updated to pull markups from the MAIN filenames into the ALT files

*/




/* February 29th, 2020
	Removed makePrecropAlpha to provide for WebProduction to add alphas by hand 
	
	*/


/* December 4th, 2019
	- added line to allow omission of BG Plate file extensions (update #05468)
	*/

/*October 15th, 2019
	- added makePrecropAlpha
	
*/



/*September 11th, 2019
	- Moved "Get Command result" function to RHLibrary
	-

*/

/*February 12th, 2019
	- renamePaths() function added outside of MAIN to rename all paths as Path 1, Path 2, Path 3, etc
	*/




	#include "/Volumes/ImageCenter/CREATIVE_PRODUCTION/Tech_Resources/Actions/rhLibrary.jsx" 
	//#include "/Volumes/ImageCenter/CREATIVE PRODUCTION/Tech Resources/Actions/makePreCropAlpha.jsx"
	var statusHandling;
	function logging(item){
		var date = new Date;
		var user = String(File("~/").displayName);
		var log = File(Folder.desktop.fsName + "/WIPBuilder.log");
		var filename = "";
		try{filename = app.activeDocument.name;} catch(err){filename = $.fileName}
		app.system("touch " + log);
		log.open("a", "TEXT", "????");
		log.write(String([user, date, filename, " :::::::::: ", item, '\n'].join(' ')));
		log.close();
	}
	
	
	
	
	var smartObjectFiles = new Array;
	var outsourceLibrary = "/Volumes/Tundra/Resource_Library/";
	var metadata;
	if (!String.prototype.trim) {
		(function() {
			// Make sure we trim BOM and NBSP
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			String.prototype.trim = function() {
				return this.replace(rtrim, '');
			};
		})();
	}
	
	Array.prototype.indexOf = function(value){
		for(var count = 0; count< this.length; count++){
				if(this[count] == value){
					return count;
				}
		}
		
		return -1;	
	}
	
	
	function rename_curves(pos){
		for(var x = 0; x<pos.artLayers.length; x++){
			if(pos.artLayers[x].name.toLowerCase().indexOf('curves') > -1){
				pos.artLayers[x].name = "Photo_" + pos.artLayers[x].name;
			}
		}
		for(var x = 0; x<pos.layerSets.length; x++){
			rename_curves(pos.layerSets[x]);
		}
	
	}
	
	
	function getPDFPages(pdfFile){ // takes a file and returns an integer
		if(typeof(pdfFile) == 'string'){pdfFile=File(pdfFile);} // convert pdfPath to Flle object
		var pdfPath = String(pdfFile.fsName);
		pdfPath = pdfPath.split("(").join("\\(");
		pdfPath = pdfPath.split(")").join("\\)");
		pdfPath = pdfPath.split("\ ").join("\\ ");
		var command = "mdls -name kMDItemNumberOfPages " + pdfPath;
		var pageCount = parseInt(String(getCommandResult(command).replace("kMDItemNumberOfPages = ","")));
		return pageCount
	}
	
	
	
	
	
	function placePDFasLayers(pdfFile){
		// takes a file path
		var x = 0;
		var openDocNames=[];
		var PDFLayers = [];
			if(pdfFile === "undefined" || pdfFile.exists == false){
				app.activeDocument.artLayers.add()
				app.activeDocument.activeLayer.name = 'No GE PDF Found'; 
				PDFLayers.push(app.activeDocument.activeLayer);
				return PDFLayers
		}
		if(typeof(pdfFile) == 'string'){pdfFile=File(pdfFile);} // convert pdfPath to Flle object
		var pdfPath = String(pdfFile.fsName);
		var pageCount = getPDFPages(pdfFile);
	
	
	
		
		while(x<pageCount){
			x++;
			placePDFPage(pdfFile,x);
			app.activeDocument.activeLayer.rasterize(RasterizeType.ENTIRELAYER);		
			PDFLayers.push(app.activeDocument.activeLayer);
		}
		return PDFLayers;
	
	}
	
	
	
	
function getGlobalEditResources(){
	var docName = app.activeDocument.name.slice(0,app.activeDocument.name.indexOf('.'));
	var folder = File(app.activeDocument.path).parent; // the folder the file lives in
	if(folder.parent.parent.exists){ // check the parent's parent folder
		folder = folder.parent;
	}
	if(docName.indexOf('_m') == docName.length-2){
		docName = docName.slice(0,docName.length-2);
	}
	var findCommand = String("find " + folder + " -iname " +  docName + ".jpg");
	// find jpgs from globaledit in the parent folder
	var jpgPath = getCommandResult(findCommand);
	// check for duplicate JPGs -- in case the lowRes was downloaded
	for(var x = 0 ; x < jpgPath.split('\n').length; x++){
		if(jpgPath.split('\n')[x].indexOf('LowRes')>0){
			jpgPath = jpgPath.split('\n')[x];
			jpgPath = jpgPath.trim();
			break;
		}
	}
	// find PDFs from globaledit
	findCommand = String("find " + folder + " -iname " + docName + ".pdf");
	var pdfPath = getCommandResult(findCommand);

	for(var x = 0 ; x < pdfPath.split('\n').length; x++){
		if(pdfPath.split('\n')[x].indexOf('Markups')>0){
			pdfPath = pdfPath.split('\n')[x];
			pdfPath = pdfPath.trim();
			break;
		}
	}
	return {
		jpg: jpgPath,
		pdf: pdfPath
	}
}
 

function berger_builder(pFile){
		var oFile = File(pFile.fullName.replace("Processed","Outlines").replace(".tif","_m.jpg").replace(".psb","_m.jpg"));
		var alphaFile = File(pFile.fullName.replace("Processed","Outlines").replace(".tif","_m.psd").replace(".psb","_m.psd"));
		// check for a "psb" folder, if it's there, look for the processed file there
		var calc_psb = pFile.fullName.replace("Processed","PSBs").replace(".tif",".psb")
		var processedFolder = pFile.parent
		if(File(calc_psb).exists){
			pFile = File(calc_psb)
		}


		if(!oFile.exists && !alphaFile.exists){return;}
		else{
			// set the 'path' file based on alpha vs. outlines file
			if (!oFile.exists){
				oFile = alphaFile;
			}
			transferPaths(oFile,pFile);
			var geResources = getGlobalEditResources() // get the globaledit resources
			// load the PDFs
			placePDFasLayers(File(geResources.pdf))
			var saveFolder = Folder(String(processedFolder.parent.fullName)+"/WIPs/")
			if (!saveFolder.exists){saveFolder.create()}
			saveAsPSB(String(processedFolder.parent.fullName)+"/WIPs/", app.activeDocument.name.replace("_m",""));
			app.activeDocument.close();
		}
}
	
	
	
	
	function placePDFPage(file,x){
		var idPlc = charIDToTypeID( "Plc " );
		var desc146 = new ActionDescriptor();
		var idAs = charIDToTypeID( "As  " );
		var desc147 = new ActionDescriptor();
		var idfsel = charIDToTypeID( "fsel" );
		var idpdfSelection = stringIDToTypeID( "pdfSelection" );
		var idpage = stringIDToTypeID( "page" );
		desc147.putEnumerated( idfsel, idpdfSelection, idpage );
		var idPgNm = charIDToTypeID( "PgNm" );
		desc147.putInteger( idPgNm, x );
		var idCrop = charIDToTypeID( "Crop" );
		var idcropTo = stringIDToTypeID( "cropTo" );
		var idboundingBox = stringIDToTypeID( "boundingBox" );
		desc147.putEnumerated( idCrop, idcropTo, idboundingBox );
		var idsuppressWarnings = stringIDToTypeID( "suppressWarnings" );
		desc147.putBoolean( idsuppressWarnings, false );
		var idAntA = charIDToTypeID( "AntA" );
		desc147.putBoolean( idAntA, true );
		var idClPt = charIDToTypeID( "ClPt" );
		desc147.putBoolean( idClPt, true );
		var idPDFG = charIDToTypeID( "PDFG" );
		desc146.putObject( idAs, idPDFG, desc147 );
		var idIdnt = charIDToTypeID( "Idnt" );
		desc146.putInteger( idIdnt, 3 );
		var idnull = charIDToTypeID( "null" );
		desc146.putPath( idnull, file);
		var idFTcs = charIDToTypeID( "FTcs" );
		var idQCSt = charIDToTypeID( "QCSt" );
		var idQcsa = charIDToTypeID( "Qcsa" );
		desc146.putEnumerated( idFTcs, idQCSt, idQcsa );
		var idOfst = charIDToTypeID( "Ofst" );
		var desc148 = new ActionDescriptor();
		var idHrzn = charIDToTypeID( "Hrzn" );
		var idPxl = charIDToTypeID( "#Pxl" );
		desc148.putUnitDouble( idHrzn, idPxl, 0.000000 );
		var idVrtc = charIDToTypeID( "Vrtc" );
		var idPxl = charIDToTypeID( "#Pxl" );
		desc148.putUnitDouble( idVrtc, idPxl, -0.000000 );
		var idOfst = charIDToTypeID( "Ofst" );
		desc146.putObject( idOfst, idOfst, desc148 );
		var idAntA = charIDToTypeID( "AntA" );
		desc146.putBoolean( idAntA, true );
		executeAction( idPlc, desc146, DialogModes.NO );
	}
	
	
	
	
	
	
	
	
	function getREFs(){ // get teh associated REFs from a file's metadata
			// RETURNS a dictionary object of REFs and missingREFs
	
			var curFile = app.activeDocument;
			var metadata = curFile.xmpMetadata.rawData;
			var hasGoBy = false;
			var REFs = [];	
	
	
	// get the GoBys
			var reGoBys = RegExp("<RH:GoBy_Filename>(.+)</RH", 'g')
			// get all of the REFS
			if(reGoBys.test(metadata)){
				hasGoBy = true;
				var m;
				do{
					m = reGoBys.exec(metadata);
					if(m != null) { 
						REFs.push(m[1]);
						hasGoBy = true;
						}
				}while(m)
			}
	// got the GoBys
	
	//get the REFs        
			var reREF = RegExp("<RH:finish.+Ref>(.+)</RH", 'g')
	
			// get all of the REFS
			//if(hasGoBy == false && reREF.test(metadata)){
			if(reREF.test(metadata)){
				var m;
				do{
					m = reREF.exec(metadata);
					if(m != null) { REFs.push(m[1]) }
				}while(m)
			}
	// got the REFs    
	
	//get Additional Support Asset
			var reSupportAsset = RegExp("<RH:AdditionalSupportAsset>(.+)</RH:AdditionalSupportAsset>", 'g')
			if(reSupportAsset.test(metadata)){
				var supportAssets = reSupportAsset.exec(metadata)[1];
				supportAssets=supportAssets.split(",") // attempt to print the support asset tag
				for (var cx = 0 ; cx<supportAssets.length;cx++){REFs.push(supportAssets[cx].trim())}
				$.writeln(supportAssets)
				//REFs.push(supportAssets);
			}
	
	
	
	
	// check for "correct to sample" TODO
			var correctToSampleFinishes = [];
	// 
	
	
	
	// get background plates
	
		var backgroundFile = null;
		// looks at the file's metadata and searches for the background
		var curFile = app.activeDocument;
		var metadata = curFile.xmpMetadata.rawData;
		//get the BG
				// Example::         <RH:backgroundPlate>BG_OD_Universal</RH:backgroundPlate>			
		var backgroundName = RegExp("<RH:backgroundPlate>(.+)</RH");
		if(backgroundName.test(metadata)){
				m = backgroundName.exec(metadata);
				if(m != null) {backgroundFile = m[1]; }
		}
		// if there's a specified background, then search for the file
	//	$.writeln(backgroundName.exec(metadata));
		// if a file is found, return the path to the file
		
	// 
	
	
	
	
	
	
	
	
	
				var missingRefs= [];
				var downloadedRefs = [];
				var saveLocation = String(Folder.desktop + "/WIPBuilder/"+ app.activeDocument.name.slice(0,app.activeDocument.name.indexOf('.'))); // the location on the local drive where the REFs will be saved to
				if(Folder(saveLocation).exists == false){ // if the save location doesn't yet exist, make it
				app.system('mkdir -p ' + saveLocation); } 
			// find the REFs and download them to the saveLocation
				for(var x =0; x <REFs.length; x++){
					var currentRefName;
				if (String(REFs[x]).indexOf('.tif')>2){
					currentRefName = String(REFs[x]);
				}
				else{
					currentRefName  = String(REFs[x]+".tif")
				}
	
				var command = String('find ' + outsourceLibrary + ' -iname ' + currentRefName + ' -exec cp {} ' + saveLocation+"/ \\;");
				app.system(command);
				$.sleep(5)
				// check that the REF downloaded
				var expectedFile = String(saveLocation + "/" + currentRefName);
				if(!File(expectedFile).exists){missingRefs.push(currentRefName); } // if the REF didn't download,, record the name
				else{ downloadedRefs.push(expectedFile); } 
			}
		
		
		
		
		
		
		
		
		
	//	$.writeln(backgroundFile);
		
		
			return {
				REFs: downloadedRefs,
				missingREFs: missingRefs,
				background: backgroundFile
				}
			
		}
	
	
	
	
	
	
	
	function handleMissingREFs(missingREFs){//takes a list of REF names that were not found and alerts the user accordingly
	//		var missingREFs = ['TEST'];
			for(var x = 0; x < missingREFs.length; x++){ // loop throught the list of missing REF names
				var missingREF = missingREFs[x];
				var finalFile = getFinalsPath(missingREF)
				if(finalFile != -1 && finalFile != undefined){
					placeDocument(finalFile);
					app.activeDocument.activeLayer.move(getLayerByName("Ref", "LayerSet"), ElementPlacement.INSIDE);
					continue;
				}
				app.activeDocument.artLayers.add().name = String("Missing Reference File: " + missingREF);
				app.system("touch ~/Desktop/WIPBuilder.log")
				logging("Missing REF: " + missingREF);
			}
			return;
		}
	
	
	
	function getGlobalEditResources(){
		var docName = app.activeDocument.name.slice(0,app.activeDocument.name.indexOf('.'));
		var folder = File(app.activeDocument.path).parent;
		if(folder.parent.parent.exists){ // check the parent's parent folder
			folder = folder.parent;
		}
		if(docName.indexOf('_m') == docName.length-2){
			docName = docName.slice(0,docName.length-2);
		}
		var findCommand = String("find " + folder + " -iname " + docName);
		// find jpgs from globaledit in the parent folder
		findCommand = String("find " + folder + " -iname " +  docName + ".jpg");  
		var jpgPath = getCommandResult(findCommand);
		// check for duplicate JPGs -- in case the lowRes was downloaded
		for(var x = 0 ; x < jpgPath.split('\n').length; x++){
			if(jpgPath.split('\n')[x].indexOf('LowRes')>0){
				jpgPath = jpgPath.split('\n')[x];
				jpgPath = jpgPath.trim();
				break;
			}
		}
		// find PDFs from globaledit
		findCommand = String("find " + folder + " -iname " + docName + ".pdf");
		var pdfPath = getCommandResult(findCommand);
	
		for(var x = 0 ; x < pdfPath.split('\n').length; x++){
			if(pdfPath.split('\n')[x].indexOf('Markups')>0){
				pdfPath = pdfPath.split('\n')[x];
				pdfPath = pdfPath.trim();
				break;
			}
		}
		return {
			jpg: jpgPath,
			pdf: pdfPath
		}
	}
	
	
	
	
	
	
	
	function saveAsPSB(saveFolder, saveName){
	//~ Saves the current file to725 a specified directory
		var desktop = new Folder("~/Desktop/");
		if(String(saveFolder) === "undefined"){ saveFolder = desktop.selectDlg("Save to:"); }
		if(String(saveName) === "undefined"){
			saveName = prompt("Save PSB as");
			if(saveName === "undefined"){
				saveName = app.activeDocument.name;
			}
		}
		if(saveName.indexOf(".")>0){
			saveName = saveName.slice(0, saveName.indexOf("."));
		}
		var savePath = String(saveFolder+"/"+saveName);
		
	
		var idsave = charIDToTypeID( "save" );
		var desc116 = new ActionDescriptor();
		var idAs = charIDToTypeID( "As  " );
		var desc117 = new ActionDescriptor();
		var idPhteight = charIDToTypeID( "Pht8" );
		desc116.putObject( idAs, idPhteight, desc117 );
		var idIn = charIDToTypeID( "In  " );
		desc116.putPath( idIn, new File( savePath) );
		var idDocI = charIDToTypeID( "DocI" );
		desc116.putInteger( idDocI, 601 );
		var idLwCs = charIDToTypeID( "LwCs" );
		desc116.putBoolean( idLwCs, true );
		var idsaveStage = stringIDToTypeID( "saveStage" );
		var idsaveStageType = stringIDToTypeID( "saveStageType" );
		var idsaveBegin = stringIDToTypeID( "saveBegin" );
		desc116.putEnumerated( idsaveStage, idsaveStageType, idsaveBegin );
		executeAction( idsave, desc116, DialogModes.NO );
	
	
	
	}
	
	
	
	
	
	
	var saveLocation;
	function buttonUp(pos){
		if(String(pos) === "undefined"){ pos = app.activeDocument; }
		if(pos.artLayers.length > 0){
			for(var x = 0; x < pos.artLayers.length; x ++){
				if(pos.artLayers[x].name == "Shadow - copy"){ pos.artLayers[x].name = "shadow"; }
				if(pos.artLayers[x].name == "Curves 1" || pos.artLayers[x].name == "Hue/Saturation 1"){ 
					var curLayer = pos.artLayers[x];
					if(curLayer.name == 'Curves 1' && curLayer != curLayer.parent.artLayers[1]){
						moveLayerDown(curLayer);
					}
					if(curLayer.name == 'Hue/Saturation 1' && curLayer != curLayer.parent.artLayers[0]){
						moveLayerUp(curLayer);
					}
						try{pos.artLayers[x].grouped = true; }catch(err){}
					}
				
			}
		}
		
		if(pos.layerSets.length >0){
			for(var c = 0; c < pos.layerSets.length; c++){
				if(pos.layerSets[c].name == "Ref"){
					labelRed(pos.layerSets[c]);
				}
			buttonUp(pos.layerSets[c]);
			}
		}
	}
	
	
	
	
	
	function main(){
		statusHandling= confirm("Incorrect image Status Handling.\n Do you wish to continue to process files with incorrect image status?")
		if(!Folder(outsourceLibrary).exists){
			alert("Not connected to Tundra. Please connect and try again");
			return 0; // don't run if not connected to tundra
		};
		if(!Folder("/Volumes/product_development/").exists){
			alert("Not connected to product_development. Please connect and try again");
			return 0; // don't run if not connected to PD server
		};
	
		// Attempt to mute the dialogs
		try{
			var _displayDialogs = app.displayDialogs;
			app.displayDialogs = DialogModes.NO;
			// For these users, set up the place docs setting
			if(user == "ccheatham"){
				placeDocsAsSmartObject(true);
				
			}
		}
		catch(e){}
		
		// Set up some variables for ease of use
		var deletePDF = false; // Variable to determine if we delete the PDF layer or not
		var processedFolder; // The folder that contains the 'processed' images
		var pdfFolder; // The folder that contains the PDFs
		var outlinesFolder; // The Folder that contains the outlines
		var userPointedFolder = Folder.selectDialog("Select the resource folder");
		var processedFiles;
		var outlineFiles;
		var pdfFiles;
		var baselayer;
		if(userPointedFolder === "undefined" || userPointedFolder == null){ return -1; } // If the user exits out of the 'select folder' dialog, exit the script
		
		
		//Determine where the user pointed and then find the other folders relative to the user's pointed folder
		//This only goes one layer deep
		// DEV:: Future versions may have a better search algorithm 
		switch(userPointedFolder.name){ 
			case "Processed":
			case "PDF":
			case "Outlines":
				processedFolder = Folder(decodeURI(userPointedFolder.parent)+ "/Processed");
				pdfFolder = Folder(decodeURI(userPointedFolder.parent)+ "/PDF");
				outlinesFolder = Folder(String(decodeURI(userPointedFolder.parent)+ "/Outlines"));
				break;
			default: 
				processedFolder = Folder(decodeURI(userPointedFolder)+ "/Processed");
				pdfFolder = Folder(decodeURI(userPointedFolder)+ "/PDF");
				outlinesFolder = Folder(String(decodeURI(userPointedFolder)+ "/Outlines"));
				break;
		}
	
	
		// If the script was unable to find the processed folder or outlines folder, alert the user and exit. 
		// DEV:: Future versions may allow the user to continue without the outlines folder
		if(!processedFolder.exists 
			|| !outlinesFolder.exists){
			alert("Unable to find resources");
			return -1;
		}
		
		
		//Get the actual files from the folders. If there's an error, catch it and log the error
		try{processedFiles = processedFolder.getFiles("*.tif");} catch(err){logError(err);}
		try{outlineFiles = outlinesFolder.getFiles("*.jpg");} catch(err){logError(err);}
		try{pdfFiles = pdfFolder.getFiles("*.pdf");} catch(err){logError(err);}
	
		//Working through each of the processed files, compile the resources and build the WIP
		var ALTs = []; // store all ALT files
		var MAINs = []; // store all MAIN files
		for(var xd = 0; xd < processedFiles.length; xd++){
			deletePDF = false; // This is used later to tell the script whether or not to delete the PDF from the layer stack
			metadata = "";
			var curFile = processedFiles[xd]; // The current working file (note: could I call this the CWF?)
			// Run the preflight on the file
			if(preflight(curFile) == -1){ continue; } // 20200727 REVERT BEFORE DELIVERY???? NEED TO CHECK PREVIOUS CODE - HAVE ALPHAS BEEN INCLUDED? DOES BRAD HAVE ISSUES WITH THIS LINE?
			//If there's already a WIP, ask the user if they want to overwrite it. If the user doesn't want to overwrite it, move to the next file
			var possibleWIPLocation = File(String(processedFolder.parent + "/WIPS/" + processedFiles[xd].name.slice(0,processedFiles[xd].name.indexOf(".")) +".psb" ));
	
			if(possibleWIPLocation.exists){
				if(!confirm("WIP Found\nAllow overwriting of file " + processedFiles[xd].name.slice(0,processedFiles[xd].name.indexOf(".")) +".psb?")){
					continue;
				}
			}

			
		
			// Define a few variables related to the CWF(current working file) for ease of work
			var curName = curFile.name.slice(0, curFile.name.indexOf("."));
			var outlineFile = File(String(outlinesFolder + "/"+curName + "_m.jpg"));
			var pdfFile = File(String(pdfFolder + "/"+curName + ".pdf"));
			var pdfLayer;

			// Add handler for PSBs delivered by photo
			// need to use curl to request the processed path
			// caluclate the wips path and assess if it exists
			// if wips_path exists, download the wips_path run the "berger builder" 
			var gx_processed_path = getProcessedPath(curName+'.tif');
			var gx_calc_wips_path = gx_processed_path.toLowerCase().replace('processed','wips').replace('.tif','.psb')
			if (File(gx_calc_wips_path).exists == true ){
				// make a PSBs directory @ processedFolder/PSBs/
				var psb_folder = Folder(processedFolder.parent + "/PSBs/");
				if(!psb_folder.exists){ psb_folder.create(); } // make psb folder as needed
				var psb_dest = File(psb_folder.fsName+"/"+curName+'.psb')
				
				// download the psb
				var command = String("rsync "+gx_calc_wips_path+" "+psb_dest.fullName)
				getCommandResult(command)
				while(psb_dest.length != File(gx_calc_wips_path).length) {} // wait until the file finishes downloading
				// execute the berger builder on the psb_dest
				// berger_builder(processedFolder,outlinesFolder)
				// need to send a single file to the berger_builder, not the whole folder
				berger_builder(curFile)
				// berger_builder(psb_folder,outlinesFolder)
				// CONTINUE TO NEXT FILE
				continue;
			}



			function checkForAlphas(){
			//check for Alphas
			var alphasPath = getAlphasPath(curName+".tif")
			logging($.line + " Alphas server path : " + alphasPath);
			if(File(alphasPath).exists){
				var command = "cp " + alphasPath + " " + outlinesFolder;
				logging($.line + " command to download alphas : " + alphasPath);			
				app.system(command);
				outlineFile = File(outlinesFolder + "/" + File(alphasPath).name);
				logging($.line + " Alphas downloaded path : " + outlineFile.fullName);
			} }// end of ALPHA exception
			checkForAlphas();
			// If the outline file exists, compile it with the processed files
			if(outlineFile.exists){
				try{app.open(outlineFile);}
				catch(err){
					alert("Line " + $.line + "\n" +err + "\n Attempting to resolve locally.\n" + outlineFile);
					var tifName = outlineFile.fullName.replace(".jpg",".tif");
					alert("mv " + outlineFile.fullName + " " + tifName);
					app.system("mv " + outlineFile.fullName + " " + tifName);
				   // $.writeln(tifName);
					app.open(File(tifName));
					
				}
	
	
				// Ensure that the file is in Adobe RGB 1998
				if(app.activeDocument.colorProfileType = ColorProfile.NONE || app.activeDocument.colorProfileName != "Adobe RGB (1998)"){
					app.activeDocument.colorProfileName = "Adobe RGB (1998)";
				}
			
	
				var del = app.activeDocument.activeLayer; // Store a reference variable for the black, empty layer in the outline file
				placeDocument(curFile); // Place the corresponding processed image into the outline file
				del.remove(); // Delete the black, empty layer
				
				// Open the smart object (the placed processed file)		
				openSmartObject(); 
				app.activeDocument.pathItems.removeAll();
				// Look for any guides and transfer them over.
				var guidesC = new Array;
				var guidesD = new Array;
				if(app.activeDocument.guides.length > 0){
					for(var xq = 0; xq < app.activeDocument.guides.length; xq++){
						guidesC.push(app.activeDocument.guides[xq].coordinate);
						guidesD.push(app.activeDocument.guides[xq].direction);
					}
				}
				
	
				// If the file has any paths or more than 1 layer if there is more than one layer unpack it. Otherwise, rasterize the smart object
				if(app.activeDocument.pathItems.length == 0){
					if(app.activeDocument.artLayers.length  == 1 && app.activeDocument.layerSets.length == 0){
						app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
						app.activeDocument.activeLayer.rasterize (RasterizeType.ENTIRELAYER);
						baselayer = app.activeDocument.artLayers[app.activeDocument.artLayers.length-1];
					}
					else{
						app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
						unpackSmartObject();
						app.activeDocument.artLayers[app.activeDocument.artLayers.length-1].remove();
						if(app.activeDocument.artLayers.length > 1){
							baselayer = app.activeDocument.artLayers[app.activeDocument.artLayers.length-1];
							groupAllLayers(); 
						}
						else if(app.activeDocument.artLayers.length == 0 && app.activeDocument.layerSets.length > 0){
							while(app.activeDocument.layerSets.length > 0){
									for(var counter = 0; counter < app.activeDocument.layerSets.length; counter++){
										app.activeDocument.activeLayer = app.activeDocument.layerSets[counter];
										ungroup();
									}
							}
							for(var counter = 0; counter < app.activeDocument.artLayers.length; counter++){
								if(app.activeDocument.artLayers[counter].kind != LayerKind.NORMAL && app.activeDocument.artLayers[counter].kind != LayerKind.SMARTOBJECT){
									app.activeDocument.artLayers[counter].remove();
								}
							}
							baselayer = app.activeDocument.artLayers[app.activeDocument.artLayers.length-1];
						}
						else{
							baselayer = app.activeDocument.artLayers[app.activeDocument.artLayers.length-1];
						}
					}
				}
				else if(app.activeDocument.pathItems.length > 0){
					smartObjectFiles.push(docCoreName());
					app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
					baselayer = app.activeDocument.artLayers[app.activeDocument.artLayers.length-1];
				}
			
			
				// Place all of the guides if there were any
				if(guidesC.length > 0){
					for(var c = 0;  c < guidesC.length; c++){
						app.activeDocument.guides.add(guidesD[c], guidesC[c]);
					}
				}
				// Done placing guides
			
			
			
	
			
				// Name the active Layer "Original" for furture use
				app.activeDocument.activeLayer.name = "Original"; // Name the layer for sorting in the future
				
				
				// Transfer the stickies
				// transferNotes(curFile, app.activeDocument);
				
			}
			// If the outline file doesn't exist, open the processed file
			else if(!outlineFile.exists){
				app.open(curFile);
				baselayer = app.activeDocument.artLayers[app.activeDocument.artLayers.length-1];
				// If there is more than 1 layer in the document group them all together and name the group for sorting
				if(app.activeDocument.artLayers.length > 1){
					groupAllLayers();
					// Name the active Layer "Original" for furture use
					app.activeDocument.activeLayer.name = "Original";
				}
			}
		
			// Place the PDF and rasterize it
			if(pdfFile.exists){ 
				placeDocument(pdfFile);
				pdfLayer = app.activeDocument.activeLayer;
				pdfLayer.rasterize (RasterizeType.ENTIRELAYER);
				pdfLayer.name = "PDF";
			}
			// If there isn't a matching PDF, create a blank layer and set the deletePDF variable to true
			else if(!pdfFile.exists){
				pdfLayer = app.activeDocument.artLayers.add();
				pdfLayer.name = "PDF";
				deletePDF = true;
			}
		
		
		
	//start build////start build////start build////start build////start build////start build////start build////start build////start build////start build////start build////start build////start build//
	
	// Deselect the paths so the script doesn't come up with vector masks
		deselectPaths(); 
		// Define some variables for ease of use
		var docRef = app.activeDocument;
		var layerSetNames = ["Ref", "main", "cc", "pixel", "Shadow", "BG"];
		var originalCopyNames = ["Shadow - copy", "product"];
		var layerNames = ["clone", "Hue/Saturation 1", "Curves 1"];
		var allLayerNames = ["clone", "Hue/Saturation 1", "Curves 1", "Shadow - copy", "product", "Ref", "main", "cc", "pixel", "Shadow", "BG", "orig", "PDF"];
		
		//Iterate over the layerSetNames variable and create the corresponding layerSets
		for(var q = layerSetNames.length-1; q >= 0;  q--){
			var cName = layerSetNames[q];
			docRef.layerSets.add();
			docRef.activeLayer.name = cName;
		}
		
		// rename curve layers from the photo team
		//rename_curves(app.activeDocument); // added on 2021
	
		//Iterate over the originalCopyNames variable and create the corresponding copies of the background
	//~ 	baselayer.name = docCoreName().slice(0, docCoreName().indexOf("_m"));
		baselayer.name = 'orig';
		for(var q = originalCopyNames.length - 1; q >= 0; q--){
			// if working with the shadow layer; 
			//$.writeln(originalCopyNames[q])
			if (originalCopyNames[q] == "Shadow - copy"){
				// search for any layers w/ suffix "_shadow" (could have file extension on layer name)
				
				function get_shadow_layer(pos){
					for (var counter=0; counter<pos.artLayers.length;counter++){ // search layers in the pos
						if(pos.artLayers[counter].name.toLowerCase().indexOf("_shadow")>1){ app.activeDocument.activeLayer = pos.artLayers[counter]; } // set the active layer so we can return it later 
					}
					// search all groups recursively
					for (var counter=0; counter<pos.layerSets.length;counter++){ 
						get_shadow_layer(pos.layerSets[counter]);
					}
					//$.writeln(app.activeDocument.activeLayer.name)
					return app.activeDocument.activeLayer;
				}
				get_shadow_layer(app.activeDocument)
			// if we find the shadow layer, change the name to "Shadow - copy" and continue
				if (app.activeDocument.activeLayer.name.toLowerCase().indexOf('_shadow') > 1) { app.activeDocument.activeLayer.name = "Shadow - copy"}
			}
			
			if (app.activeDocument.activeLayer.name != "Shadow - copy"){
			// if we didn't find the shdow layer from the studio, then copy the original layer and continue onwards 
				docRef.activeLayer = baselayer;
				newLayerFromCurrent();
				docRef.activeLayer.name = originalCopyNames[q];
			}
			// set the shadow layer to the correct blend mode
			if(originalCopyNames[q] == "Shadow - copy"){
				docRef.activeLayer.blendMode = BlendMode.NORMAL;
			}
		}
	
		//Iterate over the layerNames and create them
		for(var q = layerNames.length-1;  q >= 0; q --){
			switch(layerNames[q]){
				case "clone":
					docRef.artLayers.add();
					break;
				case "Hue/Saturation 1":
					newHueSaturationLayer();
					break;
				case "Curves 1":
					newCurvesLayer();
					break;
			}	
			docRef.activeLayer.name = layerNames[q];		
		}
	
	
	
		
		
		
	//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort//Sort
		//ORGANIZE/SORT LAYERS
		function sortLayers(){
			for(var nI = 0; nI < allLayerNames.length; nI ++){ //nI is the name Index
				var curName = allLayerNames[nI]
				getLayerByName(curName);
				var layerRef = app.activeDocument.activeLayer;
				
				
				switch(curName){
					case "clone":
						if(layerRef.parent != "[LayerSet Pixel]"){
							layerRef.move(getLayerByID(getLayerIDByName("pixel", "LayerSet")), ElementPlacement.INSIDE);
						}
						if(layerRef != layerRef.parent.artLayers[layerRef.parent.artLayers.length-1]){
							layerRef.move(layerRef.parent.artLayers[layerRef.parent.artLayers.length-1], ElementPlacement.PLACEAFTER);
						}
						break;
						
					case "Hue/Saturation 1":
						if(layerRef.parent != "[LayerSet Shadow]"){
							layerRef.move(getLayerByID(getLayerIDByName("Shadow", "LayerSet")), ElementPlacement.INSIDE);
						}
						if(layerRef != layerRef.parent.artLayers[0]){
							layerRef.move(layerRef.parent.artLayers[0], ElementPlacement.PLACEBEFORE);
						}
						break;
						
					case "Curves 1":
						if(layerRef.parent != "[LayerSet Shadow]"){
							layerRef.move(getLayerByName("Shadow"), ElementPlacement.INSIDE);
						}
						
						break;
						
					case "Shadow":
						if(layerRef != docRef.layerSets[docRef.layerSets.length - 2]){
							layerRef.move(docRef.layerSets[docRef.layerSets.length - 1], ElementPlacement.PLACEAFTER);
						}
						break;
						
					case "product": 
						if(layerRef.parent != "[LayerSet Main]"){
							layerRef.move(getLayerByID(getLayerIDByName("main", "LayerSet")), ElementPlacement.INSIDE);
						}
							layerRef.move(layerRef.parent, ElementPlacement.PLACEATEND);
						break;
						
					case "Ref":
						if(layerRef != docRef.layerSets[0]){
							layerRef.move(docRef.layerSets[0], ElementPlacement.PLACEBEFORE);
						}
						break;
						
					case "main":
						if(layerRef != docRef.layerSets[docRef.layerSets.length - 3]){
							layerRef.move(docRef.layerSets[docRef.layerSets.length -2], ElementPlacement.PLACEBEFORE);
						}
						break;
						
					case "cc":
						if(layerRef.parent != "[LayerSet Main]"){
							layerRef.move(getLayerByID(getLayerIDByName("main", "LayerSet")), ElementPlacement.PLACEBEFORE);
							moveLayerDown(layerRef);
						}
						if(layerRef != layerRef.parent.layerSets[0]){
							layerRef.move(layerRef.parent.layerSets[0], ElementPlacement.PLACEBEFORE);
						}
						break;
						
					case "pixel":
						if(layerRef.parent != "[LayerSet Main]"){
							layerRef.move(getLayerByID(getLayerIDByName("main", "LayerSet")), ElementPlacement.PLACEBEFORE);
							moveLayerDown(layerRef);
						}
						if(layerRef != layerRef.parent.layerSets[1]){
							layerRef.move(layerRef.parent.layerSets[1], ElementPlacement.PLACEAFTER);
						}
						break;
						
					case "Shadow - copy":
						if(layerRef.parent != "[LayerSet Shadow]"){
							layerRef.move(getLayerByID(getLayerIDByName("Shadow","LayerSet")), ElementPlacement.INSIDE);
						}
						if(layerRef != layerRef.parent.artLayers[layerRef.parent.artLayers.length-1]){
							layerRef.move(layerRef.parent.artLayers[layerRef.parent.artLayers.length-1], ElementPlacement.PLACEAFTER);
						}
						break;
						
					case "BG":
						while(layerRef != docRef.layerSets[docRef.layerSets.length-1]){
							moveLayerDown(layerRef);
						}
						break;
	//~ 				case docCoreName():
	//~ 					if(layerRef.parent != app.activeDoument){
	//~ 						layerRef.move(getLayerByID(getLayerIDByName("BG", "LayerSet")), ElementPlacement.PLACEAFTER);
	//~ 					}
	//~ 					break;
					case "PDF":
						var illegal = new Error("Illegal argument");
						try{
							if(layerRef.parent.name != "Ref"){
								layerRef.move(getLayerByID(getLayerIDByName("Ref", "LayerSet")), ElementPlacement.INSIDE);
							}
						}
						catch(illegal){
							break;
						}
						break;
				}//end of switch-case
			}//end of for loop
		}//end of sort function
		sortLayers(); // Run the sort Function
		getLayerByName("Original");
		app.activeDocument.activeLayer.move(getLayerByID(getLayerIDByName("main", "LayerSet")), ElementPlacement.PLACEBEFORE);
		moveLayerDown(app.activeDocument.activeLayer, 5);	
	/////// New for Version 2 -- adding REFs via GE provided metadata	
		var resources;  /// 20200727 -- Does this need to live here? Seems to work better in testing but was previously defined at the start of version2() be sure to update this from two lines below BEFORE DELIVERY
		function version2(){
			// the following will be at the end of the WIP Builder
			resources = getGlobalEditResources();
			var REFs;
			logging('Found GE JPG resources: ' + resources.jpg);
			logging('Found GE REF resources: ' + resources.REFs )
			if(File(resources.jpg.trim()).exists){
				app.open(File(resources.jpg.trim()));
				logging(app.activeDocument);
				 REFs = getREFs();
				app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
			}
			var REFGroup = getLayerByName("Ref", "LayerSet");
		// place PDF
			var pdfLayers;
			if (resources.pdf != undefined){
				storePDF(resources.pdf, metadata); //store the PDF on the server
				pdfLayers = placePDFasLayers(File(resources.pdf));
				if(pdfLayers.length == 0){
					app.activeDocument.artLayers.add();
					app.activeDocument.activeLayer.name = "No GlobalEdit Markup PDF Found";
					pdfLayers.push(app.activeDocument.activeLayer);
					logging("No PDF Found for Document");
			
				}
			}else{
				app.activeDocument.artLayers.add();
				app.activeDocument.activeLayer.name = "No GlobalEdit Markup PDF Found";
				pdfLayers.push(app.activeDocument.activeLayer);
				logging("No PDF Found for Document");
			}
			for(var c = 0; c < pdfLayers.length; c++){
				var cLayer = pdfLayers[c];
				cLayer.move(REFGroup, ElementPlacement.INSIDE);
			}
			
			
		// place REFs
			try{
				for(var x = 0; x < REFs.REFs.length; x++){
					//$.writeln(REFs.REFs[x]);
						placeDocument(REFs.REFs[x]);
						var del = app.activeDocument.activeLayer;
						unpackSmartObject(app.activeDocument.activeLayer);
						logging(app.activeDocument.activeLayer.name);
						app.activeDocument.activeLayer.name = String(File(REFs.REFs[x]).displayName); //maybe delete this
						app.activeDocument.activeLayer.move(REFGroup, ElementPlacement.PLACEAFTER);
						moveLayerUp();
						app.activeDocument.activeLayer.visible = false;
						app.activeDocument.activeLayer = del;
						app.activeDocument.activeLayer.remove();
						
	
				}
			// Deal with the missing REFs
				handleMissingREFs(REFs.missingREFs);
			}catch(err){
				logging(err);
			}// REFS are placed
		
		// Place background
		var backgroundFolder = "/Volumes/Tundra/Resource_Library/Backgrounds";
			try{	
					var bg = REFs.background;
					logging("Background from Metadata: " + bg);
					if(bg.indexOf('.')>1){bg=bg.slice (0,bg.indexOf('.'))} // updated to allow the omissions of the background extensions - December 4th, 2019 -- update #05468
					var command = String('find ' + backgroundFolder + ' -iname ' + bg + ".*");
					logging("Background command: " + command);
					var fileLocation = getCommandResult(command);
					try{
							fileLocation =fileLocation.split("\n")[0].split();
							
					}catch(err){}
					logging("Place background: " + String(fileLocation));
	//				app.activeDocument.activeLayer = getLayerByName("BG","LayerSet");
					placeDocument(File(decodeURI(fileLocation).trim()));
					app.activeDocument.activeLayer.move(getLayerByName("BG", "LayerSet"), ElementPlacement.PLACEAFTER);
					app.activeDocument.activeLayer = getLayerByName(bg);
					moveLayerUp();
									  
			}
		catch(err){
			logging("Background placement error: " + err);
		}
		// background is placed
			
	
		}/// end of newness for Version 2 -- adding REFs via GE provided metadata
		version2();
	//	makePreCropAlpha(); // add ALPHA for pre-crop // coommented out 2/29/2020 due to the implementation of Web Production adding pre-crop alphas
		renamePaths();
		buttonUp();
		getLayerByName('Ref', "LayerSet");
		app.activeDocument.activeLayer.visible = false;
		var saveLocation = Folder(String(decodeURI(processedFolder.parent) + "/WIPs"));
		if(saveLocation.exists == false){saveLocation.create();}
		saveAsPSB(saveLocation, app.activeDocument.name.slice(0,app.activeDocument.name.indexOf("_m.")));
		getLayerByName("Original");
		// rename the Original Layer
		if(app.activeDocument.activeLayer.name == "Original"){
	//~ 		app.activeDocument.activeLayer.name = docCoreName();
			app.activeDocument.activeLayer.name = 'orig';
		}
		getLayerByName("PDF");
		if(app.activeDocument.activeLayer.name == "PDF"){
			if(app.activeDocument.activeLayer.parent.name != "Ref"){app.activeDocument.activeLayer.move(getLayerByName("Ref"), ElementPlacement.INSIDE);}
			if(deletePDF){
				getLayerByName("PDF");
				app.activeDocument.activeLayer.remove();
			}
		}
		
	
	
	
	
	//~ 	getLayerByName(String(docCoreName()),"ArtLayer");
		getLayerByName('orig', 'ArtLayer');
	//~ 	if(app.activeDocument.activeLayer.parent != app.activeDocument && app.activeDocument.activeLayer.name == docCoreName()){
		if(app.activeDocument.activeLayer.parent != app.activeDocument && app.activeDocument.activeLayer.name == 'orig'){
			app.activeDocument.activeLayer.move(getLayerByName("BG","LayerSet"), ElementPlacement.PLACEAFTER);
			
	
		}
		if(app.activeDocument.activeLayer.name == 'orig' && app.activeDocument.activeLayer.typename == 'ArtLayer'){
			labelRed(getLayerByName('orig', 'ArtLayer'));
			app.activeDocument.activeLayer.visible = false;
		}
	
		try{
			getLayerByName('orig', 'LayerSet');
			if(app.activeDocument.activeLayer.typename == 'LayerSet'){
				app.activeDocument.activeLayer.name = 'exposures'
			}
		}
		catch(e){}
	
	
	// updates from 20200727
	
		function check_shot_type(filename){
			// take a file path or filename as an argument to check for MAIN/ALT designation.
			// if the file is undefined, use the active document
			if (filename == null || filename == undefined){
				filename = app.activeDocument.name;
			}
			// prep filename to send to BASH
			filename = filename.replace(".psb", ".") // remove extension
			if(filename.search('.tif')){filename = filename.replace(".tif",'.')}; // remove extension
			var result = null;
			var bash = '''curl \"https://web:web@galaxy.restorationhardware.com/fmi/xml/fmresultset.xml?-db=Web_Images&-lay=XML_WIPS_Data&ImageName=$gx_name&-find\"'''.replace("$gx_name",filename)
			var bashResult = getCommandResult(bash);
			var shotType_regex = RegExp("<field name=\"ShotType\"><data>(.+)</data>")
	//		$.writeln(bashResult);
			if(!shotType_regex.test(bashResult)){return null;}
			result = shotType_regex.exec(bashResult)[1];
			return result;
		}
	
		function findMain(filename){
			var prodID = RegExp('prod\d+').exec(filename)
			logging("ProdID found via regular expression: " + prodID)
			for (var x=0; x<processedFiles.length; x++){
				var cur_name = File(processedFiles[x]).displayName
				
	//			$.writeln(typeof(cur_name))
	//			$.writeln(cur_name)
				if(cur_name.search(prodID) && check_shot_type(cur_name) == "MAIN"){
					logging('Main found: ' + cur_name)
					return cur_name;
				}
			}
		}
		// find the main PDF associated with the mainFile
		// return a string
		function mainPDF(mainFilename){ 
			var possiblePDFs = Folder(File(resources.pdf).parent).getFiles('*.pdf');
			var castPDF = File(File(resources.pdf).fsName+ "/" + mainFilename+ ".pdf");
			if (castPDF.exists){
				return castPDF;
			}
			for (var x=0; x<possiblePDFs.length; x++){
				if(possiblePDFs[x].displayName.search(mainFilename)==0){ 
					return possiblePDFs[x];
				}
			}
			// attempt to get the PDF from the product_development volume if we haven't found it yet
			try{
				if (mainFilename.search('.') > 1){ // ensure we don't have an extension on the filename
					mainFilename = mainFilename.replace('.tif','');
					mainFilename = mainFilename.replace('.psb','')
				}
				var command = "find /Volumes/product_development/WEB/GlobalEdit_MarkUps/ -iname " + mainFilename +".pdf"
				var path = getCommandResult(command); // request terminal to find the location of the PDF
	
			}catch(err){
				logerror('Unable to find mainPDF due to error ' + err);
				return; 
			}// end of try-catch
		}// end of mainPDF()
	
		// add markups from MAIN to ALTs
		function add_MAIN_Markup(){
			if (check_shot_type() == "ALT"){ // only run this if the current file is an ALT
				// get the MAIN for the file
				var mainFilename = findMain(app.activeDocument.name);
				$.writeln(mainFilename); // DELETE AFTER DEBUG
				if (mainFilename === "undefined" || mainFilename == null || mainFilename == undefined){return 404}
				if (mainFilename[mainFilename.length-4] == "."){ mainFilename = mainFilename.substring([0],mainFilename.length-4); }
				var mainPDFfile = mainPDF(mainFilename);
				if ( mainPDFfile === "undefined" || mainPDFfile == null){ 
					//alert("No PDF found\nFound " + mainFilename + " as the main for " + app.activeDocument.name + ' but could not find the main pdf. Please select the main PDF in the next window or press cancel to ignore');
					//mainPDFfile = File.openDialog("Please select the PDF for the MAIN image corresponding to " + mainFilename);
					return "404"
				}
				if (mainPDFfile == null || mainPDFfile === "undefined") { return 0;}
				var mainPDFLayers = placePDFasLayers(mainPDFfile);
				for(var x=0; x< mainPDFLayers.length; x++){
					var layerRef = mainPDFLayers[x];
					if(layerRef.parent.name != "Ref"){
					mainPDFLayers[x].move(getLayerByID(getLayerIDByName("Ref", "LayerSet")), ElementPlacement.INSIDE);
				}
			}
			}
			else { return -1; }
		}
		
		if(add_MAIN_Markup() == "404"){
				app.activeDocument.layerSets[0].artLayers.add().name = "No Main PDF Found"
		}
	// conclusion of main updates from 20200727
	
		try{ app.activeDocument.layerSets[0].artLayers[0].visible = false; }
		catch(e){}
		collapseAllGroups();
		app.activeDocument.save();
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
		
	
		}
		try{
	
			app.displayDialogs = _displayDialogs
			// For these users, set up the place docs setting
			
			
				
			
		}
		catch(e){}
		
		
		if( smartObjectFiles.length > 0 ) { alert("Process Complete\nPlease note that the following file(s) contain Smart Objects that need your review:\n" + smartObjectFiles); }
		else{ alert("Process Complete\n"); }
		
		
		
	} // End of Main
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function logError(error){
		try{
			var errorLog = File('/Volumes/ImageCenter/CREATIVE PRODUCTION/Tech Resources/Actions/ErrorLog.txt');
			var date = new Date;
			var user = String(File("~").displayName);
			errorLog.open('a', 'TEXT', '????');
			errorLog.write(user + " " + date + "\n" + error + "\n" );
		}
		catch(err){
			//Do Nothing
			return -1;
		}
	}
	try{ //Log usage
		var usageLog = File("/Volumes/ImageCenter/CREATIVE PRODUCTION/Tech Resources/Actions/usageLog.txt");
		var date = new Date;
		var user = String(File("~/").displayName);
		usageLog.open("a", "TEXT", "????");
		usageLog.write("WIP Builder" + "\n" + user + " " + date + "\n");
		usageLog.close();
	}
	catch(err){}
	
	function preflight(doc){
		// run basic preflight on the file by checking the metadata for the following:
			// Status like "Ready for WIPing"
		
		try{
			var curFile = app.open(doc);
			var docName = app.activeDocument.name.slice(0,app.activeDocument.name.indexOf('.'));
			var folder = File(app.activeDocument.path).parent;
			}catch(err){return -1;}
		if(folder.parent.parent.exists){ // check the parent's parent folder
			folder = folder.parent;
		}
	
		// find the GE provided jpg or return false/prompt
		findCommand = String("find " + folder + " -iname " +  docName + ".jpg");
		var jpgPath = getCommandResult(findCommand);
		jpgPath = File(decodeURI(jpgPath).trim())
		// if  the jpg isn't found, prompt to continue
	
		if(!jpgPath.exists){
			logging(jpgPath + " + not found"); 
			statusHandling = confirm("JPG not found for file.\n"+docName+"\nDo you wish to process this file?\nFile may be in incorrect status or have inappropriate metadata.");
		}
		// however if the JPG metadata is found, get the metadata and check the status
		if (statusHandling == false){ return -1 }
		if (statusHandling == undefined){
			app.open(jpgPath);
			   app.preferences.rulerUnits =  Units.PIXELS; // Precrop check -- added 20190625
	//~            if(app.activeDocument.height != 2924 || app.activeDocument.width != 3000){  // Precrop check -- added 20190625
	//~                if( !confirm("Precrop Warning\n The image does not appear to be pre-cropped, do you wish to continue?")){ // Precrop check -- added 20190625
	//~                    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES); // Precrop check -- added 20190625
	//~                    return false; // Precrop check -- added 20190625
	//~                }else{} // Precrop check -- added 20190625
	//~            } // Precrop check -- added 20190625
			metadata = app.activeDocument.xmpMetadata.rawData;
			app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
			var statusRE = RegExp("<RH:imageStatus>Retouching - Ready for WIP</RH:imageStatus>")    // <RH:imageStatus>Photo - Approved</RH:imageStatus>
			if(statusRE.test(metadata)){
				statusHandling = true;}
	//		else{
				//statusHandling= confirm("Incorrect image Status.\n Do you wish to continue to process file?\n" + docName);
			//}
		}
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
		return statusHandling;
	}
	
	function storePDF(pdfPath, metadata){
		try{
			if(metadata == null || metadata === "undefined"|| metadata == "") { metadata = app.activeDocument.xmpMetadata.rawData; }
			//find the category and brand of the file
			var brandRE = RegExp("<RH:WA_Division>(.*)</RH:WA_Division","g")
			var categoryRE = RegExp("<RH:WA_Category>(.*)</RH:WA_Category>","g")
			var category = categoryRE.exec(metadata)[1]; // this is looking for the Category as shown on the Web Assortment Sheet
			var brand = brandRE.exec(metadata)[1];
			// create the save folder
			var saveFolderPath = "/Volumes/product_development/WEB/GlobalEdit_MarkUps/" + brand + "/" + category;
			if(!Folder(saveFolderPath).exists){Folder(saveFolderPath).create();}
			// copy the pdf to the save folder
			pdfPath = pdfPath.replace("(","\\(");
			pdfPath = pdfPath.replace(")","\\)");
			pdfPath = pdfPath.replace(/ /g,"\\ ");
			var command =String("cp " + pdfPath + " " + saveFolderPath);
			app.system(command)}
		catch(err){
			logError(err)
			}
	}
	
	function renamePaths(){ // added  2/12/2020 to loop over all paths in document and rename as the corresponding number from the index
		for (var x=0; x < app.activeDocument.pathItems.length; x++){
			try{
			app.activeDocument.pathItems[x].name=String("Path " + (x+1));
			}catch(err){}
		}
	}
	
	

	
	main();
	 