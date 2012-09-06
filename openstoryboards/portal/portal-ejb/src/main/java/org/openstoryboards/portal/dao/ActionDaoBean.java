package org.openstoryboards.portal.dao;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.openstoryboards.portal.dao.common.AbstractDaoBean;
import org.openstoryboards.portal.entity.Action;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Action_;
import org.openstoryboards.portal.entity.Pad;

@Stateless
public class ActionDaoBean extends AbstractDaoBean<Action> implements ActionDao {

	@Override
	public Collection<Action> getActionList(Pad pad, long fromVersion) {
		//TODO must check for actions of a specific pad
		/*CriteriaBuilder builder = getCriteriaBuilder();
		CriteriaQuery<Action> query = builder.createQuery(Action.class);
		Root<Action> action = query.from(Action.class);
		query.where(
			builder.and(
				builder.greaterThan(action.get(Action_.padVersion), fromVersion),
				builder.equals()
			)
		);
		query.orderBy(builder.desc(action.get(Action_.padVersion)));
		return getResultList(query);*/
		return new LinkedList<Action>();
	}

}
