#---------------------------------------------------------------------------------
# Author: Jeremiah Rounds
# Email: jeremiah.rounds@pnnl.gov
# Time:  Fri Oct 23 15:33:03 2015
#---------------------------------------------------------------------------------

#' Save global environment data for displays
#'
#' Makes data available in the global environment of all displays of a connection in trelliscope
#'
#' @param data data of class "ddo" or "ddf" (see \code{\link{ddo}}, \code{\link{ddf}})
#' @details Useful to avoid bloating individual displays with global variables common to all displays in a data base.
#' 
#' @author Jeremiah Rounds
#'
#'
#' @examples
#' data(iris)
#' saveGlobals(iris)
#'
#' @export
saveGlobals = function(..., conn=getOption("vdbConn")){
	validateVdbConn(conn)
	save(..., file = file.path(conn$path, "globals.Rdata"))
	
}