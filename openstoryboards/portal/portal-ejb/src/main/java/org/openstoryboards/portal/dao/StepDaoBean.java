package org.openstoryboards.portal.dao;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.ejb.Stateless;
import javax.inject.Inject;

import org.openstoryboards.portal.dao.common.AbstractDaoBean;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.PadHardVersion;
import org.openstoryboards.portal.entity.Step;
import org.openstoryboards.portal.entity.enums.Right;
import org.openstoryboards.portal.entity.User;

@Stateless
public class StepDaoBean extends AbstractDaoBean<Step> implements StepDao, Serializable {
	private static final long serialVersionUID = -505877394989426923L;
	
}
