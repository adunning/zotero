/*
    ***** BEGIN LICENSE BLOCK *****
    
    Copyright © 2009 Center for History and New Media
                     George Mason University, Fairfax, Virginia, USA
                     http://zotero.org
    
    This file is part of Zotero.
    
    Zotero is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Zotero is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
    
    ***** END LICENSE BLOCK *****
*/

Components.utils.import("resource://gre/modules/Services.jsm");

/**
 * This object contains the various functions for the interface
 */
var ZoteroStandalone = new function()
{
	/**
	 * Run when standalone window first opens
	 */
	this.onLoad = function() {
		if(!Zotero || !Zotero.initialized) {
			ZoteroPane.displayStartupError();
			window.close();
			return;
		}
		ZoteroPane.init();
		ZoteroPane.makeVisible();
		
		// Run check for corrupt installation, where the wrong Gecko runtime is being used
		if(Zotero.isMac) {
			 var greDir = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("GreD", Components.interfaces.nsIFile);
			if(greDir.isSymlink() || greDir.leafName !== "Current") {
				var ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
										.getService(Components.interfaces.nsIPromptService);
				ps.alert(null, "", Zotero.getString('standalone.corruptInstallation'));
			}
		}
		
	}
	
	/**
	 * Builds new item menu
	 */
	this.buildNewItemMenu = function() {
		var addMenu = document.getElementById('menu_NewItemPopup');
		
		// Remove all nodes so we can regenerate
		while(addMenu.hasChildNodes()) addMenu.removeChild(addMenu.firstChild);
		
		var typeSets = [Zotero.ItemTypes.getPrimaryTypes(), Zotero.ItemTypes.getSecondaryTypes()];
		for(var i in typeSets) {
			var t = typeSets[i];
			
			// Sort by localized name
			var itemTypes = [];
			for (var i=0; i<t.length; i++) {
				itemTypes.push({
					id: t[i].id,
					name: t[i].name,
					localized: Zotero.ItemTypes.getLocalizedString(t[i].id)
				});
			}
			var collation = Zotero.getLocaleCollation();
			itemTypes.sort(function(a, b) {
				return collation.compareString(1, a.localized, b.localized);
			});
			
			for (var i = 0; i<itemTypes.length; i++) {
				var menuitem = document.createElement("menuitem");
				menuitem.setAttribute("label", itemTypes[i].localized);
				menuitem.setAttribute("oncommand","ZoteroPane_Local.newItem("+itemTypes[i]['id']+")");
				menuitem.setAttribute("tooltiptext", "");
				menuitem.className = "zotero-tb-add";
				addMenu.appendChild(menuitem);
			}
			
			// add separator between sets
			if(i !== typeSets.length-1) {
				addMenu.appendChild(document.createElement("menuseparator"));
			}
		}
	}
	
	/**
	 * Opens a URL in the basic viewer
	 */
	this.openInViewer = function(uri) {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var win = wm.getMostRecentWindow("zotero:basicViewer");
		if(win) {
			win.loadURI(uri);
		} else {
			window.openDialog("chrome://zotero/content/standalone/basicViewer.xul",
				"basicViewer", "chrome,resizable,centerscreen", uri);
		}
	}
	
	/**
	 * Handles help menu requests
	 */
	this.openHelp = function(type) {
		if(type === "troubleshooting") {
			ZoteroPane.loadURI("http://www.zotero.org/support/getting_help");
		} else if(type === "feedback") {
			ZoteroPane.loadURI("http://forums.zotero.org/categories/");
		} else {
			ZoteroPane.loadURI("http://www.zotero.org/support/");
		}
	}
	
	/**
	 * Called before standalone window is closed
	 */
	this.onUnload = function() {
		ZoteroPane.destroy();
	}
}

/** Taken from browser.js **/
function toJavaScriptConsole() {
	toOpenWindowByType("global:console", "chrome://global/content/console.xul");
}

function toOpenWindowByType(inType, uri, features)
{
	var topWindow = Services.wm.getMostRecentWindow(inType);
	
	if (topWindow) {
		topWindow.focus();
	} else if(features) {
		window.open(uri, "_blank", features);
	} else {
		window.open(uri, "_blank", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
	}
}

window.addEventListener("load", function(e) { ZoteroStandalone.onLoad(e); }, false);
window.addEventListener("unload", function(e) { ZoteroStandalone.onUnload(e); }, false);