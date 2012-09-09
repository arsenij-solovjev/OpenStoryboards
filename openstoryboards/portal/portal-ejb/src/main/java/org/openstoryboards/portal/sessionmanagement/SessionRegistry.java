package org.openstoryboards.portal.sessionmanagement;

import java.util.HashMap;

import org.openstoryboards.portal.entity.User;
/**
 * manages a mapping of user to session id.
 * @author arsenij
 *
 */
public interface SessionRegistry {
	void add(String sessionId, User user); 
	User getUserBySessionId(String sessionId);
	void remove(String sessionId);
	HashMap<String, User> getSessionToUser();
}
