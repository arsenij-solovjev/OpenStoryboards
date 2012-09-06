package org.openstoryboards.portal;

import java.util.logging.Logger;  


import javax.ejb.EJB;
import javax.enterprise.inject.Model;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.inject.Inject;

import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.NotEmpty;
import org.openstoryboards.portal.applogic.UserRegistration;

// The @Model stereotype is a convenience mechanism to make this a request-scoped bean that has an
// EL name
// Read more about the @Model stereotype in this FAQ:
// http://sfwk.org/Documentation/WhatIsThePurposeOfTheModelAnnotation
@Model
public class UserRegistrator {
	@Inject
	private Logger log;
	@Inject
	private FacesContext facesContext;

	@EJB
	private UserRegistration userRegistration;

	@NotEmpty 
	private String username;
	
	@NotEmpty
	private String password;
	
	@NotEmpty
	private String repassword;
	
	@NotEmpty
	@Email
	private String email;
	
	public String register() throws Exception {
		
		if(!password.equals(repassword)){
			facesContext.addMessage(null, new FacesMessage(
					FacesMessage.SEVERITY_INFO, "re-entered Password does not match initial password",
					"re-entered Password does not match initial password"));
				
			return "failure";
		}
			
		userRegistration.register(username, password, email);
		facesContext.addMessage(null, new FacesMessage(
				FacesMessage.SEVERITY_INFO, "Registered!",
				"Registration successful"));
		
		return "success";
	}
 
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}


	public String getUsername() {
		return username;
	}


	public void setUsername(String username) {
		this.username = username;
	}


	public String getRepassword() {
		return repassword;
	}


	public void setRepassword(String repassword) {
		this.repassword = repassword;
	}


	public String getEmail() {
		return email;
	}


	public void setEmail(String email) {
		this.email = email;
	}
}
