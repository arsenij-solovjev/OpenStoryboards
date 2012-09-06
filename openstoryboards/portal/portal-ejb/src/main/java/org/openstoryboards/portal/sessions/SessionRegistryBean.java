package org.openstoryboards.portal.sessions;

import java.util.HashMap;
import java.util.logging.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import org.openstoryboards.portal.entity.User;

@ApplicationScoped
public class SessionRegistryBean implements SessionRegistry {
	
	@Inject private Logger log;
	
	HashMap<String, User> sessionToUser = new HashMap<String,User>();
	
	
	@Override
	public void add(String sessionId, User user) {
		sessionToUser.put(sessionId, user);
		log.info("added user with id " + user.getId() + " to session " + sessionId);
	}

	@Override
	public void remove(String sessionId) {
		sessionToUser.remove(sessionId);
	}

	@Override
	public User getUserBySessionId(String sessionId) {
		return sessionToUser.get(sessionId);
	}

}
