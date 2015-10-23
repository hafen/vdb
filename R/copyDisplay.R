#---------------------------------------------------------------------------------
# Author: Jeremiah Rounds
# Email: jeremiah.rounds@pnnl.gov
# Time:  Fri Oct 23 10:16:33 2015
#---------------------------------------------------------------------------------


copyDisplay = function(old_name, new_name, group="common", conn = getOption("vdbConn"), verbose=TRUE){
	validateVdbConn(conn)
	#validateNameGroup(new_name, group)  #<--- don't work because validateNameGroup is a macro like funciton with side-effect assignment instead of a return.
	#validateNameGroup(old_name, group)
	old_path_info = trelliscope:::validateNameGroup2(old_name, group)
	new_path_info = trelliscope:::validateNameGroup2(new_name, group)
	vdbPrefix <- conn$path
	old_path = file.path(vdbPrefix, "displays",old_path_info$group, old_path_info$name)
	new_path = file.path(vdbPrefix, "displays",new_path_info$group, new_path_info$name)
    checkDisplayPath(new_path, verbose)
	copyVerify = trelliscope:::copy_dir(old_path, new_path)
	   # Verify the file renaming
    if(!copyVerify) {
      stop("Copy files for display were not successfully moved to '", new_path, "'", call. = FALSE)
    } 
	select = c("group",
		"name",
		"desc", 
		"n",
      "panelFnType",
      "preRender",
      "dataClass", 
      "cogClass",
      "height",
      "width",
      "updated",
      "keySig"
	)
	subsetDisplayObj =
	#we have to update the display object
	display_path = file.path(new_path, "displayObj.Rdata")
	e = new.env()
	load(display_path, envir=e)
	e$displayObj$name = new_name 
	displayObj = e$displayObj
	save(displayObj, file = display_path)
    updateDisplayList.displayObj(displayObj, conn)

}