package org.openstoryboards.portal.security;

import java.io.Serializable;
import java.util.logging.Logger;

import javax.ejb.Stateless;
import javax.enterprise.context.SessionScoped;
import javax.enterprise.inject.Produces;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpSession;

import org.jboss.seam.security.Authenticator;
import org.jboss.seam.security.BaseAuthenticator;
import org.jboss.seam.security.Credentials;
import org.jboss.seam.security.Identity;
import org.openstoryboards.portal.dao.UserDao;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.sessions.SessionRegistry;
import org.picketlink.idm.impl.api.PasswordCredential;
import org.picketlink.idm.impl.api.model.SimpleUser;

@Named
@SessionScoped
public class SimpleAuthenticator extends BaseAuthenticator implements
		Authenticator, Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Inject
	Credentials credentials;
	@Inject
	UserDao userDao;
	@Inject
	Identity id;
	@Inject
	SessionRegistry sessions;
	@Inject
	Logger log;

	@Produces
	@CurrentUser
	@Named
	private
	User currentUser;

	@Override
	public void authenticate() {
		User u = userDao.findByUsername(credentials.getUsername());

		if (credentials.getCredential() instanceof PasswordCredential
				&&

				u.getPassword().equals(
						((PasswordCredential) credentials.getCredential())
								.getValue())) {

			setStatus(AuthenticationStatus.SUCCESS);

			setUser(new SimpleUser(Long.toString(u.getId())));
			this.setCurrentUser(u);
		}

	}
	
	/**
	 * stores sessionId and user in application scope
	 */
	@Override
	public void postAuthenticate() {
		
		FacesContext fCtx = FacesContext.getCurrentInstance();
		HttpSession session = (HttpSession) fCtx.getExternalContext()
				.getSession(false);
		String sessionId = session.getId();

		sessions.add(sessionId, getCurrentUser());

	}

	public User getCurrentUser() {
		return currentUser;
	}

	public void setCurrentUser(User currentUser) {
		this.currentUser = currentUser;
	}

}