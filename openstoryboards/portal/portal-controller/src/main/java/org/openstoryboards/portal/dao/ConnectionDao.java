package org.openstoryboards.portal.dao;

import javax.ejb.Local;

import org.openstoryboards.portal.dao.common.Dao;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.entity.enums.Right;

@Local
public interface ConnectionDao extends Dao<Connection>{
	/**
	 * creates a new (open) connection to a given user and pad with an unique access token.
	 * returns null if their is already an connection to user and pad
	 * @param user
	 * @param pad
	 * @return
	 */
	Connection createConnection(User user, Pad pad);
	
	/**
	 * returns the connection with the given access token
	 * an null if no such a connection could be found
	 * @param accessToken
	 * @return
	 */
	Connection getConnection(String accessToken);
	
	/**
	 * marks the connection as closed
	 * @param connection
	 */
	void releaseConnection(Connection connection);
}
