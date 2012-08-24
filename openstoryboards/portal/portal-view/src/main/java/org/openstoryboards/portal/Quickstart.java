package org.openstoryboards.portal;

import java.util.logging.Logger;

import javax.enterprise.inject.Model;
import javax.inject.Inject;

import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.rest.imageservice.images.PadFactory;

@Model
public class Quickstart {

	@Inject 
	private PadFactory padFactory;
	
	
	public String createNewPad(){
		Pad pad = padFactory.make();
		return "editor?padId=" + pad.getId() + "&faces-redirect=true";
	}
	
	
}
