package org.openstoryboards.portal.testdata;

import javax.persistence.EntityManager;

import org.openstoryboards.portal.entity.User;

import de.akquinet.jbosscc.needle.db.testdata.AbstractTestdataBuilder;

public class UserTestdataBuilder extends AbstractTestdataBuilder<User> {

	private static final String DEFAULT_PASSWORD = "secret";
	private String withUsername;

	public UserTestdataBuilder() {
		super();
	}

	public UserTestdataBuilder(EntityManager entityManager) {
		super(entityManager);
	}

	public UserTestdataBuilder withUsername(String username) {
		this.withUsername = username;
		return this;
	}


	private String getUsername() {
		return withUsername != null ? withUsername : "mmuster" + getId();
	}

	@Override
	public User build() {
		final User user = new User();
		user.setUsername(getUsername());
	
		user.setPassword(DEFAULT_PASSWORD);

		return user;
	}

}
