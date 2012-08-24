package org.openstoryboards.portal.entity;

import javax.annotation.Generated;
import javax.persistence.metamodel.ListAttribute;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Step.class)
public abstract class Step_ extends org.openstoryboards.portal.entity.common.AbstractEntity_ {

	public static volatile SingularAttribute<Step, Step> predecessor;
	public static volatile SingularAttribute<Step, Connection> connection;
	public static volatile SingularAttribute<Step, Boolean> undone;
	public static volatile ListAttribute<Step, Action> actions;

}

