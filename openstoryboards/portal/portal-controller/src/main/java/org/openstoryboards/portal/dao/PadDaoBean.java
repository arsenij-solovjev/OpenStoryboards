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
import org.openstoryboards.portal.entity.enums.Right;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.entity.enums.Right;

@Stateless
public class PadDaoBean extends AbstractDaoBean<Pad> implements PadDao, Serializable {
	private static final long serialVersionUID = -2024347049541478703L;
	
	@Inject
	private PadHardVersionDao padVersionDao;
	
	@Override
	public Set<Right> getRightsFor(User user, Pad pad) {
		Set<Right> rights = new HashSet<Right>();
		if(pad.getReaders().contains(user))
			rights.add(Right.READ);
		if(pad.getWriters().contains(user))
			rights.add(Right.WRITE);
		return rights;
	}

	@Override 
	public String getLatestVersion(long padId) {
		Pad pad = find(padId);
		List<String> allVersions = null;//pad.getVersions();
		int lastElement = allVersions.size()-1;
		return allVersions.get(lastElement);
	}

	@Override
	public Pad createPad(String title) {
		//make pad
		Pad pad = new Pad();		
		pad.setTitle(title);
		persist(pad);
		
		//make a hard version
		PadHardVersion version = null;
		do { //TODO looks really dirrrty
			version = padVersionDao.createBlankVersion(pad);
		} while(version==null);
		return pad;
	}

}
