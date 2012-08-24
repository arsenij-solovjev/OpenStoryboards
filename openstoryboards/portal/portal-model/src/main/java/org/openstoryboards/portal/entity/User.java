package org.openstoryboards.portal.entity;

import java.io.Serializable; 

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlRootElement;

import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.NotEmpty;
import org.openstoryboards.portal.entity.common.AbstractEntity;

//import org.picketlink.idm.api.User; 

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User  extends AbstractEntity {
	
	@NotNull
	@NotEmpty
	private String username;
	
	@NotNull
	@NotEmpty
	@Email
	private String email;


	@NotNull
	@NotEmpty
	private String password;
	
	private boolean isActivated = false;

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isActivated() {
		return isActivated;
	}

	public void setActivated(boolean isActivated) {
		this.isActivated = isActivated;
	}

	public boolean verifyPassword(String unverifiedPassword) {
		
		return password.equals(unverifiedPassword);
	} 
	
	
}
