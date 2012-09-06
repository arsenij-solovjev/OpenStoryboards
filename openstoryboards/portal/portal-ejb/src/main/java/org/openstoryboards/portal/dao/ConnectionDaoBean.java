package org.openstoryboards.portal.dao;

import java.util.List;

import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.openstoryboards.portal.dao.common.AbstractDaoBean;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.User;

import org.openstoryboards.portal.entity.Connection_;

@Singleton
public class ConnectionDaoBean extends AbstractDaoBean<Connection> implements ConnectionDao {

	private static final int ACCESS_TOKEN_LENGTH = 40;
	
	private Connection getActiveConnection(User user, Pad pad) {
		CriteriaBuilder builder = getCriteriaBuilder();
		CriteriaQuery<Connection> query = builder.createQuery(Connection.class);
		Root<Connection> connection = query.from(Connection.class);
		query.where(
			builder.and(
				builder.equal(connection.get(Connection_.pad), pad),
				builder.equal(connection.get(Connection_.user), user),
				builder.equal(connection.get(Connection_.active), true)
			)
		);
		return getSingleResult(query);
	}
	
	private String generateAccessToken() {
		final String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		String accessToken = "";
		do {
			//generate string
			StringBuilder builder = new StringBuilder(ACCESS_TOKEN_LENGTH);
			while(builder.length() < ACCESS_TOKEN_LENGTH)
				builder.append(characters.charAt((int) (Math.random()*ACCESS_TOKEN_LENGTH)));
			//test if exists	
			accessToken = builder.toString();
		} while(getConnection(accessToken)!=null);
		return accessToken;
	}
	
	@Lock(LockType.WRITE)
	@Override
	public Connection createConnection(User user, Pad pad) {
		//TODO must be called under mutual exclusion
		//search for an active connection with user and pad
		Connection connection = getActiveConnection(user, pad);
		if(connection!=null)
			return null;
		//create connection
		connection = new Connection();
		connection.setUser(user);
		connection.setPad(pad);
		connection.setActive(true);
		connection.setAccessToken(generateAccessToken());
		persist(connection);
		return connection;
	}

	@Lock(LockType.READ)
	@Override
	public Connection getConnection(String accessToken) {
		CriteriaBuilder builder = getCriteriaBuilder();
		CriteriaQuery<Connection> query = builder.createQuery(Connection.class);
		Root<Connection> connection = query.from(Connection.class);
		query.where(builder.equal(connection.get(Connection_.accessToken), accessToken));
		return getSingleResult(query);
	}

	@Lock(LockType.WRITE)
	@Override
	public void releaseConnection(Connection connection) {
		connection.setActive(false);
		persist(connection);
	}
}
