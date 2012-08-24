package org.openstoryboards.portal.dao;

import java.util.Set;

import javax.ejb.Local;

import org.openstoryboards.portal.dao.common.Dao;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.entity.enums.Right;

@Local
public interface PadDao extends Dao<Pad>{
	/**
	 * the rights the user has on this pad
	 * @param user
	 * @param padId
	 * @return
	 */
	Set<Right> getRightsFor(User user, Pad pad);

	/**
	 * creates a new pad named with "title"
	 * @param owner
	 * @return
	 */
	Pad createPad(String title);
	//TODO add (dynamic) width and height
	
	/**
	 * the path to the latest saved version of this pad
	 * @param parseLong
	 * @return
	 */
	String getLatestVersion(long padId);
}