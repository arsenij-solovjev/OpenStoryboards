package org.openstoryboards.portal;

import java.util.HashMap;
import java.util.Map;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;

import org.openstoryboards.portal.dao.PadDao;
import org.openstoryboards.portal.dao.UserDao;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.sessions.SessionRegistry;

@Stateless
public class DebugEnvironment {
	private static final Map<String, String> SESSIONS = new HashMap<String, String>() {{
		//put(<sessionId>, <username>);
		put("debug",  "fry");
		put("debug2", "leela");
		put("debug3", "bender");
	}};
	
	@Inject
	private SessionRegistry sessionRegistry;

	@Inject
	private UserDao userDao;
	
	@Inject
	private PadDao padDao;
	
	public void setup() {
		//create pad
		Pad pad = padDao.createPad("debug pad");
		
		//create users and sessions
		for(String sessionId: SESSIONS.keySet()) {
			String username = SESSIONS.get(sessionId);
			
			//create user
			User user = new User();
			user.setUsername(username);
			user.setPassword(username);
			user.setEmail(username+"@futurama.com");
			user.setActivated(true);			
			userDao.persist(user);
			
			//create session
			sessionRegistry.add(sessionId, user);
			
			//add as reader and writer
			pad.getReaders().add(user);
			pad.getWriters().add(user);
		}
		padDao.persist(pad);
	}	
}
