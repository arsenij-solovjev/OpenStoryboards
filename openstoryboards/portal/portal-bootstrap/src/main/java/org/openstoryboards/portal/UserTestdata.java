package org.openstoryboards.portal;

import javax.ejb.EJB;
import javax.ejb.Stateless;

import org.openstoryboards.portal.dao.UserDao;
import org.openstoryboards.portal.entity.User;

@Stateless
public class UserTestdata {

	private static final String PASSWORD = "os";
	private static final String EMAIL = "@mail.com";
	private static final String USERNAME = "os";
	
	@EJB
	private UserDao userDao;

	public void insert() {
			
			User user = new User();
			
			user.setUsername(USERNAME);
			user.setPassword(PASSWORD);
			user.setEmail(USERNAME + EMAIL);
			user.setActivated(true);
			
			userDao.persist(user);
	}

}
