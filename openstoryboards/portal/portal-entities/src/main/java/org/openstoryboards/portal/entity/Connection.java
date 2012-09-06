package org.openstoryboards.portal.entity;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import org.openstoryboards.portal.entity.common.AbstractEntity;

@Entity
public class Connection extends AbstractEntity {
	private static final long serialVersionUID = 1L;

	private String accessToken;
	private boolean active;
	
	@ManyToOne
	private Pad pad;
	
	@ManyToOne
	private User user;
	
	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public Pad getPad() {
		return pad;
	}

	public void setPad(Pad pad) {
		this.pad = pad;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}
}
