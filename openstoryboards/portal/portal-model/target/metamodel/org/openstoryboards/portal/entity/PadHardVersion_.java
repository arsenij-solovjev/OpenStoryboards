package org.openstoryboards.portal.entity;

import javax.annotation.Generated;
import javax.persistence.metamodel.CollectionAttribute;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(PadHardVersion.class)
public abstract class PadHardVersion_ extends org.openstoryboards.portal.entity.common.AbstractEntity_ {

	public static volatile SingularAttribute<PadHardVersion, Pad> pad;
	public static volatile SingularAttribute<PadHardVersion, String> path;
	public static volatile CollectionAttribute<PadHardVersion, Action> actionSettings;
	public static volatile SingularAttribute<PadHardVersion, Long> version;

}

