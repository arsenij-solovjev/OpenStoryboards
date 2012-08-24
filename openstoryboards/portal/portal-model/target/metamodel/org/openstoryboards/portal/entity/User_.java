package org.openstoryboards.portal.entity;

import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(User.class)
public abstract class User_ extends org.openstoryboards.portal.entity.common.AbstractEntity_ {

	public static volatile SingularAttribute<User, String> username;
	public static volatile SingularAttribute<User, Boolean> isActivated;
	public static volatile SingularAttribute<User, String> email;
	public static volatile SingularAttribute<User, String> password;

}

