package org.openstoryboards.portal.entity;

import javax.annotation.Generated;
import javax.persistence.metamodel.CollectionAttribute;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Pad.class)
public abstract class Pad_ extends org.openstoryboards.portal.entity.common.AbstractEntity_ {

	public static volatile SingularAttribute<Pad, Integer> latestVersion;
	public static volatile SingularAttribute<Pad, String> title;
	public static volatile CollectionAttribute<Pad, User> writers;
	public static volatile CollectionAttribute<Pad, User> readers;

}

