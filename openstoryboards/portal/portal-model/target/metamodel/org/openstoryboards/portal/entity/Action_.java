package org.openstoryboards.portal.entity;

import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;
import org.openstoryboards.portal.entity.enums.ActionType;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Action.class)
public abstract class Action_ extends org.openstoryboards.portal.entity.common.AbstractEntity_ {

	public static volatile SingularAttribute<Action, String> action;
	public static volatile SingularAttribute<Action, Long> padVersion;
	public static volatile SingularAttribute<Action, ActionType> type;
	public static volatile SingularAttribute<Action, Step> step;

}

