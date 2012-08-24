package org.openstoryboards.portal.dao;

import javax.ejb.Local;

import org.openstoryboards.portal.dao.common.Dao;
import org.openstoryboards.portal.entity.Step;

@Local
public interface StepDao extends Dao<Step> {
	
}