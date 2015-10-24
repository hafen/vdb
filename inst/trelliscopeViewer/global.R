globalsFile = "globals.Rdata"
if(file.exists(globalsFile)){
	message("Loading globals")
	load(globalsFile)	
}