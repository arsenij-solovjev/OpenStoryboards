package org.openstoryboards.portal.dao;

import javax.ejb.Local;

import org.openstoryboards.portal.dao.common.Dao;
import org.openstoryboards.portal.entity.User;

@Local
public interface UserDao extends Dao<User> {

	User findByUsername(String username);

}
