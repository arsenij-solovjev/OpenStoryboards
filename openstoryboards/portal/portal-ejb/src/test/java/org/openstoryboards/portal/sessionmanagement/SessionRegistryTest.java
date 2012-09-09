package org.openstoryboards.portal.sessionmanagement;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.logging.Logger;
import org.junit.Before; 
import org.junit.Test; 
import org.openstoryboards.portal.entity.User;
import static org.mockito.Mockito.mock;

public class SessionRegistryTest { 
	
	private static final String SESSION_ID = "sessionId";
	SessionRegistryBean sr;
	
	@Before
	public void setUp(){
		sr = new SessionRegistryBean();
		sr.log = mock(Logger.class);
	}
	
	@Test
	public void testGetSessionToUser(){
		assertNotNull(sr.getSessionToUser());
	}
	
	@Test
	public void testAdd(){ 
		addNullUser();
		assertEquals(1, sr.getSessionToUser().size());
	}

	@Test
	public void testRemove(){
		addNullUser();
		sr.remove(SESSION_ID);
		assertEquals(0, sr.getSessionToUser().size());
	}
	
	@Test
	public void testGetUserBySessionId(){
		addNullUser();
		assertNotNull(sr.getUserBySessionId(SESSION_ID));
	}

	private void addNullUser() {
		String sessionId = SESSION_ID;
		User user = new User();
		sr.add(sessionId, user);
	}
}
