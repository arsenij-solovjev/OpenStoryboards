package org.openstoryboards.portal.imageprocessor;

import javax.ejb.Stateless;
import javax.inject.Inject;

import org.openstoryboards.portal.dao.ActionDao;
import org.openstoryboards.portal.dao.PadHardVersionDao;
import org.openstoryboards.portal.dao.StepDao;

@Stateless
public class DaoCollection {
	@Inject 
	private PadHardVersionDao hardVersonDao;
	@Inject 
	private ActionDao actionDao;
	@Inject 
	private StepDao stepDao;
	public PadHardVersionDao getHardVersonDao() {
		return hardVersonDao;
	}
	public ActionDao getActionDao() {
		return actionDao;
	}
	public StepDao getStepDao() {
		return stepDao;
	}
}
