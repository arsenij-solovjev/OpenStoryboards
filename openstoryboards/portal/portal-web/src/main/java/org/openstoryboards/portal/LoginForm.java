package org.openstoryboards.portal;

import java.util.logging.Logger;

import javax.enterprise.inject.Model;
import javax.inject.Inject;

import org.jboss.seam.security.Identity;

@Model
public class LoginForm {
	@Inject
	private Logger log;
	@Inject 
	private Identity identity;
	
	public String login(){
		if(identity.login().equals("success"))
			return "start?faces-redirect=true";
		else 
			return "error?faces-redirect=true";			
	}
	
	public String logout(){
		identity.logout();
		return "welcome?faces-redirect=true";
	}
	
	
}
