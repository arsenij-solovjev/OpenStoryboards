package org.openstoryboards.portal.dao;

import java.util.Collection;

import javax.ejb.Local;

import org.openstoryboards.portal.dao.common.Dao;
import org.openstoryboards.portal.entity.Action;
import org.openstoryboards.portal.entity.Pad;

@Local
public interface ActionDao extends Dao<Action> {
	/**
	 * returns all actions of a pad from a specific version on
	 * @param fromVersion
	 * @param pad
	 * @return
	 */
	Collection<Action> getActionList(Pad pad, long fromVersion);
}
