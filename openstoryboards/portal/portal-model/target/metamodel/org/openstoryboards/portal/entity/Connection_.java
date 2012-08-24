package org.openstoryboards.portal.entity;

import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Connection.class)
public abstract class Connection_ extends org.openstoryboards.portal.entity.common.AbstractEntity_ {

	public static volatile SingularAttribute<Connection, Pad> pad;
	public static volatile SingularAttribute<Connection, String> accessToken;
	public static volatile SingularAttribute<Connection, Boolean> active;
	public static volatile SingularAttribute<Connection, User> user;

}

